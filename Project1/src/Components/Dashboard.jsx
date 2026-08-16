import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { apiUrl } from "../api";
import {
  Search, SlidersHorizontal, PlusCircle, PackagePlus, Bell, MapPin, Building,
  Calendar, Tag, User, Phone, MessageSquare, Clock, CheckCircle2, CheckCircle,
  AlertCircle, ChevronDown, Pencil, Trash2, XCircle, X, Package, SearchX, Upload, Clock3, Image as ImageIcon, Archive, ClipboardList,
  Sun, Moon, RefreshCw, BarChart3, ShieldCheck, Send, Eye, AlertTriangle, Mail, LogOut, Lock
} from "lucide-react";
import "./Dashboard.css";

const API = apiUrl("/api/reports");
const NOTIF_API = apiUrl("/api/notifications");

const emptyForm = {
  title: "", description: "", location: "",
  dateOccurred: "", category: "Other", type: "lost", image: "",
  adminDescription: ""
};

const readStoredList = (key) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

const normalizeNotification = (notification, index = 0) => {
  const fallback = {
    id: `legacy-${index}`,
    message: "Notification",
    timestamp: new Date().toISOString(),
    seen: false,
  };

  if (!notification || typeof notification !== "object") {
    return fallback;
  }

  const id = notification.id;
  const timestamp = new Date(notification.timestamp);

  return {
    id: typeof id === "string" || typeof id === "number" ? id : fallback.id,
    message: typeof notification.message === "string"
      ? notification.message
      : String(notification.message || fallback.message),
    timestamp: Number.isNaN(timestamp.getTime()) ? fallback.timestamp : timestamp.toISOString(),
    seen: Boolean(notification.seen),
  };
};

const readNotifications = () =>
  readStoredList("dashboard_notifications").map(normalizeNotification);

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("token");

  const isAdmin = user?.role === "admin" || token !== null;
  const displayName = user?.username || (isAdmin ? "Admin" : "User");
  const displayEmail = user?.email || (isAdmin ? "admin@lostfound.local" : "No email saved");
  const initials = displayName.slice(0, 1).toUpperCase();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [seenNotifications, setSeenNotifications] = useState([]);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile"); // profile | settings | theme

  // Form modals
  const [showLostForm, setShowLostForm] = useState(false);
  const [showFoundForm, setShowFoundForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Claim modal
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimerInfo, setClaimerInfo] = useState({ name: "", phone: "", description: "" });

  // Refs for dropdowns
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Inactivity timeout refs
  const inactivityWarningRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const resetInactivityTimerRef = useRef(null);

  // Inactivity warning state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(120);

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Resolve popup state
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolvePickupLocation, setResolvePickupLocation] = useState("");
  const [resolveInstructions, setResolveInstructions] = useState("");
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  // Live clock tick for edit countdown display
  const [now, setNow] = useState(() => Date.now());

  // Helper function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const fetchItems = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auth Check: Redirect to signup if not logged in
    if (!user?.username && !user?.email && !token) {
      navigate("/signup");
      return;
    }

    fetchItems();
    const saved = localStorage.getItem("seenNotifications");
    if (saved) setSeenNotifications(readStoredList("seenNotifications"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── FETCH SERVER NOTIFICATIONS ── */
  const fetchServerNotifications = async () => {
    if (!user?.username && !user?.email) return;
    try {
      const query = user.email ? `email=${encodeURIComponent(user.email)}` : `name=${encodeURIComponent(user.username)}`;
      const res = await fetch(`${NOTIF_API}?${query}`);
      if (res.ok) {
        const data = await res.json();
        // Convert server notifications to the local format and merge
        const serverNotifs = data.map(sn => ({
          id: sn._id, // use MongoDB _id
          message: sn.message,
          timestamp: sn.createdAt,
          seen: sn.seen,
          isServer: true
        }));
        
        setNotifications(prev => {
          // Merge avoiding duplicates
          const existingIds = new Set(prev.map(n => n.id));
          const newServerNotifs = serverNotifs.filter(sn => !existingIds.has(sn.id));
          
          if (newServerNotifs.length > 0) {
            const updated = [...newServerNotifs, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            // Only store local ones in localStorage
            localStorage.setItem("dashboard_notifications", JSON.stringify(updated.filter(n => !n.isServer)));
            return updated;
          }
          return prev;
        });
      }
    } catch (e) {
      console.error("Failed to fetch server notifications", e);
    }
  };

  useEffect(() => {
    fetchServerNotifications();
    // Poll every 30 seconds for new server notifications
    const interval = setInterval(fetchServerNotifications, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── INACTIVITY AUTO-LOGOUT ── */
  const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
  const WARNING_MS    =  2 * 60 * 1000; // warn 2 min before

  useEffect(() => {
    const reset = () => {
      clearTimeout(inactivityWarningRef.current);
      clearInterval(countdownIntervalRef.current);
      setShowTimeoutWarning(false);

      inactivityWarningRef.current = setTimeout(() => {
        let secs = Math.floor(WARNING_MS / 1000);
        setWarningCountdown(secs);
        setShowTimeoutWarning(true);
        countdownIntervalRef.current = setInterval(() => {
          secs -= 1;
          setWarningCountdown(secs);
          if (secs <= 0) {
            clearInterval(countdownIntervalRef.current);
            localStorage.clear();
            navigate("/login");
          }
        }, 1000);
      }, INACTIVITY_MS - WARNING_MS);
    };

    resetInactivityTimerRef.current = reset;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(inactivityWarningRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [navigate]);

  /* ── LIVE CLOCK TICK (edit countdown) ── */
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  /* ── IMAGE UPLOAD ── */
  const handleImageChange = (file) => {
    if (!file) {
      setImageFile(null);
      setForm(f => ({ ...f, image: "" }));
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality to keep size tiny (<100KB)
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setForm(f => ({ ...f, image: compressed }));
      };
    };
    reader.readAsDataURL(file);
  };

  /* ── SUBMIT REPORT ── */
  const submitForm = async (type) => {
    if (!form.title || !form.description || !form.location || !form.dateOccurred) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        type, 
        owner: { id: user.id || "", name: user.username || "Anonymous", email: user.email || "" } 
      };
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      await fetchItems();
      setForm(emptyForm);
      setImageFile(null);
      setShowLostForm(false);
      setShowFoundForm(false);
      addNotification(`New ${type} report: ${form.title}`);
    } catch (e) { alert("Error: " + e.message); }
    finally { setSubmitting(false); }
  };

  /* ── NOTIFICATIONS ── */
  const [notifications, setNotifications] = useState(() => {
    return readNotifications();
  });

  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      seen: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev.map(normalizeNotification)].slice(0, 20);
      localStorage.setItem("dashboard_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAsSeen = async (id) => {
    setNotifications(prev => {
      const updated = prev.map((n, index) => {
        const item = normalizeNotification(n, index);
        // keep isServer flag if present
        const isServer = n.isServer || false;
        return item.id === id ? { ...item, seen: true, isServer } : { ...item, isServer };
      });
      localStorage.setItem("dashboard_notifications", JSON.stringify(updated.filter(n => !n.isServer)));
      return updated;
    });
    
    // Check if it's a server notification
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.isServer) {
      try {
        await fetch(`${NOTIF_API}/${id}/seen`, { method: "PATCH" });
      } catch (e) {
        console.error("Failed to mark server notification seen", e);
      }
    } else {
      setSeenNotifications(prev => {
        const updated = Array.from(new Set([...prev, id]));
        localStorage.setItem("seenNotifications", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const markAllAsSeen = async () => {
    const allIds = notifications.map((n, index) => normalizeNotification(n, index).id);
    setNotifications(prev => {
      const updated = prev.map((n, index) => ({ ...normalizeNotification(n, index), seen: true, isServer: n.isServer || false }));
      localStorage.setItem("dashboard_notifications", JSON.stringify(updated.filter(n => !n.isServer)));
      return updated;
    });
    
    if (user?.email) {
      try {
        await fetch(`${NOTIF_API}/mark-all-seen`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
      } catch (e) {
        console.error("Failed to mark all server notifications seen", e);
      }
    }
    
    setSeenNotifications(prev => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      localStorage.setItem("seenNotifications", JSON.stringify(updated));
      return updated;
    });
  };

  const safeNotifications = notifications.map(normalizeNotification);
  const unreadCount = safeNotifications.filter(n => !n.seen).length;
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString();
  };

  /* ── ADMIN ACTIONS ── */
  const doAdminAction = async (id, endpoint, method = "PATCH") => {
    if (!token) {
      alert("Admin token missing. Please login again.");
      navigate("/login");
      return;
    }
    setBusy(id);
    try {
      const url = method === "DELETE" ? `${API}/${id}` : `${API}/${id}/${endpoint}`;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        }
      });
      if (res.status === 401 || res.status === 403) {
        alert("Session expired — please log in again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      await fetchItems();
      addNotification(`Item "${id}" ${endpoint}d successfully`);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(null);
    }
  };

  const handleAdminDelete = (id) => {
    if (window.confirm("Permanently delete this report?")) {
      doAdminAction(id, "delete", "DELETE");
    }
  };

  /* ── RESOLVE WITH PICKUP POPUP ── */
  const handleResolve = (item) => {
    setResolveTarget(item);
    // User requested to not prefill the pickup location with the item's original location
    setResolvePickupLocation("");
    setResolveInstructions("");
  };

  const submitResolve = async () => {
    if (!resolvePickupLocation.trim()) {
      alert("Please enter a pickup location.");
      return;
    }
    if (!token) {
      alert("Admin token missing. Please login again.");
      navigate("/login");
      return;
    }
    setResolveSubmitting(true);
    try {
      const res = await fetch(`${API}/${resolveTarget._id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickupLocation: resolvePickupLocation.trim(),
          pickupInstructions: resolveInstructions.trim(),
        }),
      });
      if (res.status === 401 || res.status === 403) {
        alert("Session expired — please log in again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }

      // We no longer write a pickup notification to local storage here,
      // because the backend `/resolve` endpoint creates a server-side notification
      // for the claimer and also sends them an email.

      await fetchItems();
      addNotification(`Pickup location sent to claimer for: "${resolveTarget.title}"`);
      setResolveTarget(null);
      setResolvePickupLocation("");
      setResolveInstructions("");
      // Close detail modal if open
      setSelected(null);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setResolveSubmitting(false);
    }
  };

  /* ── EDIT HELPERS (10-minute window) ── */
  const EDIT_WINDOW_MS = 10 * 60 * 1000;

  const getEditTimeLeft = (item) => {
    const created = new Date(item.createdAt).getTime();
    return EDIT_WINDOW_MS - (now - created);
  };

  const isOwnReport = (item) => {
    if (isAdmin) return false;
    if (item.owner?.id && user.id) {
      return item.owner.id === user.id;
    }
    return item.owner?.email
      ? item.owner.email === user.email
      : item.owner?.name === user.username;
  };

  const isReporterOfFoundItem = (item) => {
    if (!user) return false;
    const isOwner = (item.owner?.id && user.id && item.owner.id === user.id) ||
                    (item.owner?.email && user.email && item.owner.email === user.email) ||
                    (item.owner?.name && user.username && item.owner.name === user.username);
    return item.type === "found" && isOwner;
  };

  const getEditCountdownMessage = (item) => {
    const timeLeft = getEditTimeLeft(item);
    if (timeLeft <= 0) {
      return { text: "Editing period expired.", state: "expired" };
    }
    const secs = Math.max(0, Math.floor(timeLeft / 1000));
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    if (timeLeft < 60000) {
      return { text: "Less than 1 minute remaining.", state: "low" };
    } else if (timeLeft < 120000) {
      return { text: `You can edit this report for ${minutes} minute ${seconds} seconds.`, state: "normal" };
    } else {
      return { text: `You can edit this report for ${minutes} minutes ${seconds} seconds.`, state: "normal" };
    }
  };

  const isEditable = (item) => {
    return isOwnReport(item) && getEditTimeLeft(item) > 0;
  };

  const formatEditCountdown = (ms) => {
    const secs = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;
  };

  const handleEditImageChange = (file) => {
    if (!file) { setEditForm(f => ({ ...f, image: "" })); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 800, MAX_H = 600;
        let { width: w, height: h } = img;
        if (w > h) { if (w > MAX_W) { h *= MAX_W / w; w = MAX_W; } }
        else        { if (h > MAX_H) { w *= MAX_H / h; h = MAX_H; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setEditForm(f => ({ ...f, image: canvas.toDataURL("image/jpeg", 0.7) }));
      };
    };
    reader.readAsDataURL(file);
  };

  /* ── SUBMIT EDIT ── */
  const submitEdit = async () => {
    if (!editForm.title || !editForm.description || !editForm.location || !editForm.dateOccurred) {
      alert("Please fill in all required fields.");
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API}/${editTarget._id}/edit`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      await fetchItems();
      addNotification(`Report edited: ${editForm.title}`);
      setEditTarget(null);
    } catch (e) { alert("Error: " + e.message); }
    finally { setEditSubmitting(false); }
  };

  /* ── CLAIM ── */
  const submitClaim = async () => {
    if (!claimerInfo.name || !claimerInfo.phone || !claimerInfo.description) {
      alert("Please fill in your name, phone, and claim description.");
      return;
    }
    try {
      const res = await fetch(`${API}/${claimTarget._id}/claim`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ claimer: { ...claimerInfo, email: user.email || "" } })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      await fetchItems();
      setClaimTarget(null);
      setClaimerInfo({ name: "", phone: "", description: "" });
      setSelected(null);
      addNotification(`Claim submitted for: ${claimTarget.title}`);
      alert("Claim submitted! Waiting for admin approval.");
    } catch (e) { alert("Error: " + e.message); }
  };

  /* ── FILTERED ITEMS ── */
  const filteredItems = items.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
                        i.description.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchSearch;
    if (activeTab === "lost") return matchSearch && i.type === "lost";
    if (activeTab === "found") return matchSearch && i.type === "found";
    if (activeTab === "pending") return matchSearch && i.status === "pending";
    if (activeTab === "claimed") return matchSearch && i.status === "claimed";
    if (activeTab === "resolved") return matchSearch && i.status === "resolved";
    return matchSearch;
  });

  const getItemTime = (item) => {
    const date = new Date(item.createdAt || item.dateOccurred || 0);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const filtered = sortOrder === "all"
    ? filteredItems
    : [...filteredItems].sort((a, b) => {
        const newestFirst = getItemTime(b) - getItemTime(a);
        return sortOrder === "newest" ? newestFirst : -newestFirst;
      });

  const counts = {
    all: items.length,
    lost: items.filter(i => i.type === "lost").length,
    found: items.filter(i => i.type === "found").length,
    pending: items.filter(i => i.status === "pending").length,
    claimed: items.filter(i => i.status === "claimed").length,
    resolved: items.filter(i => i.status === "resolved").length,
  };

  const dropdownItems = [
    { key: "all", label: "All" },
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
  ];

  const currentSortLabel = dropdownItems.find(item => item.key === sortOrder)?.label || "All";

  const EditModal = ({ item, onClose }) => {
    const countdownInfo = getEditCountdownMessage(item);
    const isExpired = countdownInfo.state === "expired";

    return (
      <div className="modal" onClick={onClose}>
        <div className="modalBox" onClick={e => e.stopPropagation()}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={24} /> Edit Report</h3>
          <p style={{
            fontSize: 13,
            color: isExpired || countdownInfo.state === "low" ? "#ef4444" : "var(--text-muted)",
            marginBottom: 12,
            fontWeight: countdownInfo.state === "low" ? "bold" : "normal"
          }}>
            {countdownInfo.text}
          </p>

          <span className="fieldLabel">Title *</span>
          <input placeholder="e.g. Black laptop bag"
            value={editForm.title}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />

          <span className="fieldLabel">Description *</span>
          <textarea placeholder="Describe the item in detail..."
            value={editForm.description}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />

          <span className="fieldLabel">Private Admin Details</span>
          <textarea placeholder="Extra details only admins can see..."
            value={editForm.adminDescription}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, adminDescription: e.target.value }))} />

          <span className="fieldLabel">Location *</span>
          <input placeholder="Where was it lost/found?"
            value={editForm.location}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />

          <span className="fieldLabel">Date *</span>
          <input type="date"
            value={editForm.dateOccurred}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, dateOccurred: e.target.value }))} />

          <span className="fieldLabel">Category</span>
          <select value={editForm.category}
            disabled={isExpired}
            onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
            {["Electronics","Bags","Clothing","Documents","Keys","Wallet","Jewellery","Other"].map(c =>
              <option key={c}>{c}</option>)}
          </select>

          <span className="fieldLabel">Photo (Optional)</span>
          {editForm.image ? (
            <div className="previewWrap">
              <img src={editForm.image} className="previewImg" alt="preview" />
              <button className="removeImg" disabled={isExpired} onClick={() => setEditForm(f => ({ ...f, image: "" }))}><X size={14} style={{verticalAlign:'middle'}} /> Remove</button>
            </div>
          ) : (
            <input type="file" accept="image/*"
              disabled={isExpired}
              onChange={e => handleEditImageChange(e.target.files[0])} />
          )}

          <button className="submitBtn" disabled={editSubmitting || isExpired} onClick={submitEdit}>
            {editSubmitting ? "Saving…" : "Save Changes"}
          </button>
          <button className="cancelBtn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  };

  /* ── FORM MODAL ── */
  const FormModal = ({ type, onClose }) => (
    <div className="modal" onClick={onClose}>
      <div className="modalBox" onClick={e => e.stopPropagation()}>
        <h3>Report {type === "lost" ? "Lost" : "Found"} Item</h3>

        <span className="fieldLabel">Title *</span>
        <input placeholder="e.g. Black laptop bag"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

        <span className="fieldLabel">Description *</span>
        <textarea placeholder="Describe the item in detail..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

        <span className="fieldLabel">Private Admin Details</span>
        <textarea placeholder="Extra details only admins can see, e.g. serial number, unique marks, handover notes..."
          value={form.adminDescription}
          onChange={e => setForm(f => ({ ...f, adminDescription: e.target.value }))} />

        <span className="fieldLabel">Location *</span>
        <input placeholder="Where was it lost/found?"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />

        <span className="fieldLabel">Date *</span>
        <input type="date"
          value={form.dateOccurred}
          onChange={e => setForm(f => ({ ...f, dateOccurred: e.target.value }))} />

        <span className="fieldLabel">Category</span>
        <select value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {["Electronics","Bags","Clothing","Documents","Keys","Wallet","Jewellery","Other"].map(c =>
            <option key={c}>{c}</option>)}
        </select>

        <span className="fieldLabel">Photo (Optional)</span>
        {form.image ? (
          <div className="previewWrap">
            <img src={form.image} className="previewImg" alt="preview" />
            <button className="removeImg" onClick={() => { setForm(f => ({ ...f, image: "" })); setImageFile(null); }}><X size={14} style={{verticalAlign:'middle'}} /> Remove</button>
          </div>
        ) : (
          <input type="file" accept="image/*"
            onChange={e => handleImageChange(e.target.files[0])} />
        )}

        <button className="submitBtn" disabled={submitting}
          onClick={() => submitForm(type)}>
          {submitting ? "Submitting…" : `Submit ${type === "lost" ? "Lost" : "Found"} Report`}
        </button>
        <button className="cancelBtn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );

  /* ── DETAIL MODAL ── */
  const DetailModal = ({ item, onClose }) => (
    <div className="modal" onClick={onClose}>
      <div className="modalBox detailBox" onClick={e => e.stopPropagation()}>
        {item.image
          ? (
            <button
              type="button"
              className="imageButton detailImageButton"
              onClick={() => setSelectedImage({ src: item.image, alt: item.title })}
              aria-label={`View larger image of ${item.title}`}
            >
              <img src={item.image} className="detailImg" alt={item.title} />
            </button>
          ) : <div className="imgPlaceholder" style={{height:160, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={48} color="var(--text-muted)" /></div>}

        <div className="detailHeader" style={{marginTop:10}}>
          <h3>{item.title}</h3>
          <span className={`badge-type ${item.type}`}>{item.type}</span>
        </div>

        <div className="detailDesc">{item.description}</div>

        {isAdmin && item.adminDescription && (
          <div className="privateNote">
            <strong>Admin-only report details</strong>
            <p>{item.adminDescription}</p>
          </div>
        )}

        {isAdmin && item.claimer?.description && (
          <div className="privateNote claimPrivate">
            <strong>Claim description</strong>
            <p>{item.claimer.description}</p>
          </div>
        )}

        <div className="detailMeta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Found Location: {item.location}</span>
          {item.pickupLocation && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> Pickup Location: {item.pickupLocation}</span>}
          {item.pickupInstructions && <span style={{display: 'flex', marginTop: '10px', alignItems: 'center', gap: '6px'}}><MessageSquare size={16} /> Collection Instructions: {item.pickupInstructions}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {item.dateOccurred ? new Date(item.dateOccurred).toLocaleDateString() : "—"}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={16} /> {item.category || "Other"}</span>
          {item.owner?.name && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Reported by {item.owner.name}</span>}
        </div>

        {isAdmin && item.status === "pending" && (
          <div className="adminActions">
            <button 
              className="approveBtn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => doAdminAction(item._id, "approve")}
              disabled={busy === item._id}
            >
              <CheckCircle size={18} /> Approve Claim
            </button>
            <button 
              className="rejectBtn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => doAdminAction(item._id, "reject")}
              disabled={busy === item._id}
            >
              <XCircle size={18} /> Reject Claim
            </button>
          </div>
        )}

        {isAdmin && item.status === "claimed" && (
          <button 
            className="resolveBtn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => handleResolve(item)}
            disabled={busy === item._id}
          >
            <Archive size={18} /> Mark as Resolved
          </button>
        )}

        {isAdmin && (
          <button 
            className="deleteBtn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => handleAdminDelete(item._id)}
            disabled={busy === item._id}
          >
            <Trash2 size={18} /> Delete Report
          </button>
        )}

        {!isAdmin && item.type === "found" && item.status === "available" && (
          isReporterOfFoundItem(item) ? (
            <div className="reporterClaimMessage" style={{ 
              fontSize: '13px', 
              color: 'var(--text-muted)', 
              fontStyle: 'italic',
              textAlign: 'center', 
              padding: '8px',
              border: '1px dashed var(--text-muted)',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              marginTop: '8px',
              marginBottom: '8px'
            }}>
              You reported this item. Only other users can claim it.
            </div>
          ) : (
            <button className="claimBtn" onClick={() => { setClaimTarget(item); onClose(); }}>
              Claim This Item
            </button>
          )
        )}
        {!isAdmin && item.status === "pending" && (
          <div className="pendingNote" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock3 size={18} /> Claim pending admin approval
          </div>
        )}
        {!isAdmin && item.status === "claimed" && (
          <div className="claimedNote" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={18} /> This item has been claimed
          </div>
        )}

        {isOwnReport(item) && (
          getEditTimeLeft(item) > 0 ? (
            <button
              className="editBtn detailEditBtn"
              onClick={() => {
                setEditTarget(item);
                setEditForm({
                  title: item.title,
                  description: item.description,
                  location: item.location,
                  dateOccurred: item.dateOccurred ? new Date(item.dateOccurred).toISOString().split("T")[0] : "",
                  category: item.category || "Other",
                  image: item.image || "",
                  adminDescription: item.adminDescription || "",
                  type: item.type
                });
                onClose();
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><Pencil size={18} /> Edit Report</span>
            </button>
          ) : (
            <button className="editBtn detailEditBtn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><Lock size={18} /> Edit Expired</span>
            </button>
          )
        )}
        <button className="cancelBtn" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  /* ── CLAIM MODAL ── */
  const ClaimModal = () => (
    <div className="modal" onClick={() => setClaimTarget(null)}>
      <div className="modalBox" onClick={e => e.stopPropagation()}>
        <h3>Claim "{claimTarget?.title}"</h3>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Fill in your details. An admin will review and approve your claim.</p>

        <span className="fieldLabel">Your Name *</span>
        <input placeholder="Full name"
          value={claimerInfo.name}
          onChange={e => setClaimerInfo(c => ({ ...c, name: e.target.value }))} />

        <span className="fieldLabel">Phone Number *</span>
        <input placeholder="+254..."
          value={claimerInfo.phone}
          onChange={e => setClaimerInfo(c => ({ ...c, phone: e.target.value }))} />

        <span className="fieldLabel">Claim Description</span>
        <textarea placeholder="Describe why this item is yours. Add unique details only the owner would know."
          value={claimerInfo.description}
          onChange={e => setClaimerInfo(c => ({ ...c, description: e.target.value }))} />

        <button className="submitBtn" onClick={submitClaim}>Submit Claim</button>
        <button className="cancelBtn" onClick={() => setClaimTarget(null)}>Cancel</button>
      </div>
    </div>
  );

  /* ── SETTINGS MODAL ── */
  const SettingsModal = () => (
    <div className="modal" onClick={() => setSettingsOpen(false)}>
      <div className="modalBox settingsBox" onClick={e => e.stopPropagation()}>
        <div className="settingsHeader">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SlidersHorizontal size={24} /> Settings</h3>
          <button className="closeSettingsBtn" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={20} /></button>
        </div>

        <div className="settingsTabs">
          <button
            className={`settingsTabBtn ${settingsTab === "profile" ? "active" : ""}`}
            onClick={() => setSettingsTab("profile")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <User size={16} /> Profile
          </button>
          <button
            className={`settingsTabBtn ${settingsTab === "settings" ? "active" : ""}`}
            onClick={() => setSettingsTab("settings")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <SlidersHorizontal size={16} /> Settings
          </button>
          <button
            className={`settingsTabBtn ${settingsTab === "theme" ? "active" : ""}`}
            onClick={() => setSettingsTab("theme")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ImageIcon size={16} /> Theme
          </button>
        </div>

        <div className="settingsContent">
          {settingsTab === "profile" && (
            <div className="settingsSection">
              <div className="profileCard">
                <div className="profileAvatarLarge">{initials}</div>
                <div className="profileDetails">
                  <h4>{displayName}</h4>
                  <p>{displayEmail}</p>
                  <span className={`roleChip ${isAdmin ? "admin" : ""}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {isAdmin ? <><CheckCircle2 size={14} /> Admin</> : <><User size={14} /> User</>}
                  </span>
                </div>
              </div>
              <div className="profileInfoGrid">
                <div className="profileInfoItem">
                  <label>Username</label>
                  <span>{displayName}</span>
                </div>
                <div className="profileInfoItem">
                  <label>Email</label>
                  <span>{displayEmail}</span>
                </div>
                <div className="profileInfoItem">
                  <label>Role</label>
                  <span>{isAdmin ? "Administrator" : "Standard User"}</span>
                </div>
                <div className="profileInfoItem">
                  <label>Reports</label>
                  <span>{items.filter(i => i.owner?.name === displayName).length} submitted</span>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "settings" && (
            <div className="settingsSection">
              <div className="settingRow">
                <div>
                  <strong>Notifications</strong>
                  <p>Receive alerts for new reports and claims</p>
                </div>
                <label className="toggleSwitch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settingRow">
                <div>
                  <strong>Email Alerts</strong>
                  <p>Get email notifications for important updates</p>
                </div>
                <label className="toggleSwitch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settingRow">
                <div>
                  <strong>Sound Effects</strong>
                  <p>Play sounds for notifications</p>
                </div>
                <label className="toggleSwitch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}

          {settingsTab === "theme" && (
            <div className="settingsSection">
              <p className="themeLabel">Choose your preferred appearance</p>
              <div className="themeOptions">
                <button
                  className={`themeCard ${theme === "light" ? "active" : ""}`}
                  onClick={() => toggleTheme()}
                >
                  <div className="themePreview light">
                    <div className="previewBar"></div>
                    <div className="previewContent">
                      <div className="previewLine"></div>
                      <div className="previewLine short"></div>
                    </div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sun size={16} /> Light</span>
                </button>
                <button
                  className={`themeCard ${theme === "dark" ? "active" : ""}`}
                  onClick={() => toggleTheme()}
                >
                  <div className="themePreview dark">
                    <div className="previewBar"></div>
                    <div className="previewContent">
                      <div className="previewLine"></div>
                      <div className="previewLine short"></div>
                    </div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Moon size={16} /> Dark</span>
                </button>
              </div>
              <p className="themeNote">
                Current: <strong>{theme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── TIMEOUT WARNING MODAL ── */
  const TimeoutWarningModal = () => (
    <div className="modal timeoutModal">
      <div className="modalBox timeoutBox" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Clock size={54} color="var(--accent-blue)" /></div>
        <h3 style={{ textAlign: "center", margin: 0 }}>Still there?</h3>
        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: 14, margin: 0 }}>
          You've been inactive. You'll be logged out in
        </p>
        <div style={{
          fontSize: 56,
          fontWeight: 800,
          textAlign: "center",
          color: warningCountdown <= 30 ? "#ef4444" : "var(--accent-blue)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 3,
          transition: "color 0.4s"
        }}>
          {Math.floor(warningCountdown / 60)}:{(warningCountdown % 60).toString().padStart(2, "0")}
        </div>
        <button
          className="submitBtn"
          onClick={() => resetInactivityTimerRef.current?.()}
          style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <CheckCircle2 size={18} /> Stay Logged In
        </button>
        <button
          className="cancelBtn"
          onClick={() => { localStorage.clear(); navigate("/login"); }}
        >
          Log Out Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebarBrand">
          <Search size={28} className="brandIcon" />
          <h2>Lost & Found</h2>
        </div>

        <div className="sidebarNav">
          {!isAdmin && (
            <>
              <button className="sidebarBtn" onClick={() => { setForm({...emptyForm, type:"lost"}); setShowLostForm(true); }}>
                <PlusCircle size={18} className="sidebarIcon" /> Report Lost
              </button>
              <button className="sidebarBtn" onClick={() => { setForm({...emptyForm, type:"found"}); setShowFoundForm(true); }}>
                <PackagePlus size={18} className="sidebarIcon" /> Report Found
              </button>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="adminBadgeSidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Admin Mode
          </div>
        )}

        <div className="sidebarFooter">
          <button className="sidebarBtn logout" onClick={() => { 
            localStorage.clear(); 
            navigate("/login"); 
          }}>
            <LogOut size={18} className="sidebarIcon" /> Logout
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="userCard">
            <div className="userInfo">
              <span className="userName" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {user?.username || "Nyandeng"}</span>
              <span className={`roleTag ${isAdmin ? "adminTag" : ""}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {isAdmin ? <><ShieldCheck size={14} /> Admin</> : "User"}
              </span>
            </div>
          </div>

          <div className="topCenter">
            <div className="searchWrap">
              <Search size={18} className="searchIcon" />
              <input 
                placeholder="Search items..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          </div>

          <div className="topRight">
            {/* Theme quick toggle */}
            <button
              type="button"
              className="themeToggleBtn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="notif" ref={notifRef}>
              <button
                type="button"
                className="notifButton"
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
              >
                <Bell size={22} />
              </button>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

              {notifOpen && (
                <div className="notifDropdown" onClick={e => e.stopPropagation()}>
                  <div className="notifHeader">
                    <h4>Notifications</h4>
                    <div className="notifHeaderActions">
                      {unreadCount > 0 && (
                        <button type="button" className="markAllSeen" onClick={markAllAsSeen}>
                          Mark all seen
                        </button>
                      )}
                      <button type="button" className="closeNotif" onClick={() => setNotifOpen(false)} aria-label="Close notifications"><X size={16} /></button>
                    </div>
                  </div>
                  {safeNotifications.length === 0 ? (
                    <div className="notifItem">No notifications yet</div>
                  ) : (
                    safeNotifications.slice(0, 5).map((notif, index) => (
                      <div 
                        key={`${notif.id}-${index}`} 
                        className={`notifItem ${notif.seen ? "notifSeen" : "notifUnseen"}`}
                        onClick={() => markAsSeen(notif.id)}
                      >
                        <div className="notifLabel">{notif.message}</div>
                        <div className="notifSub">
                          {formatNotificationTime(notif.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="profileMenu" ref={profileRef}>
              <button
                type="button"
                className="profileButton"
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Profile menu"
              >
                <span className="avatar">{initials}</span>
                <span className="profileButtonText">{displayName}</span>
                <span className={`dropdownArrow ${profileOpen ? "open" : ""}`}><ChevronDown size={14} /></span>
              </button>

              {profileOpen && (
                <div className="profileDropdown">
                  <div className="profileHeader">
                    <span className="avatar large">{initials}</span>
                    <div>
                      <strong>{displayName}</strong>
                      <span>{displayEmail}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSettingsTab("profile"); setSettingsOpen(true); setProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} /> Profile
                  </button>
                  <button type="button" onClick={() => { setSettingsTab("settings"); setSettingsOpen(true); setProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SlidersHorizontal size={16} /> Settings
                  </button>
                  <button type="button" onClick={() => { setSettingsTab("theme"); setSettingsOpen(true); setProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} /> Theme
                  </button>
                  <button
                    type="button"
                    className="dangerMenuItem"
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats">
          <div className="card statTotal" onClick={() => setActiveTab("all")}>
            <div className="statIcon"><BarChart3 size={24} /></div>
            <div className="statInfo">
              <span className="statValue">{counts.all}</span>
              <span className="statLabel">Total</span>
            </div>
          </div>
          <div className="card statLost" onClick={() => setActiveTab("lost")}>
            <div className="statIcon"><AlertCircle size={24} /></div>
            <div className="statInfo">
              <span className="statValue">{counts.lost}</span>
              <span className="statLabel">Lost</span>
            </div>
          </div>
          <div className="card statFound" onClick={() => setActiveTab("found")}>
            <div className="statIcon"><CheckCircle2 size={24} /></div>
            <div className="statInfo">
              <span className="statValue">{counts.found}</span>
              <span className="statLabel">Found</span>
            </div>
          </div>
          <div className="card statPending" onClick={() => setActiveTab("pending")}>
            <div className="statIcon"><Clock3 size={24} /></div>
            <div className="statInfo">
              <span className="statValue">{counts.pending}</span>
              <span className="statLabel">Pending</span>
            </div>
          </div>
          <div className="card statClaimed" onClick={() => setActiveTab("claimed")}>
            <div className="statIcon"><CheckCircle size={24} /></div>
            <div className="statInfo">
              <span className="statValue">{counts.claimed}</span>
              <span className="statLabel">Claimed</span>
            </div>
          </div>
          {isAdmin && (
            <div className="card statResolved" onClick={() => setActiveTab("resolved")}>
              <div className="statIcon"><Archive size={24} /></div>
              <div className="statInfo">
                <span className="statValue">{counts.resolved}</span>
                <span className="statLabel">Resolved</span>
              </div>
            </div>
          )}
        </div>

        {/* ── DROPDOWN FILTER ── */}
        <div className="filterDropdown" ref={dropdownRef}>
          <button 
            className="dropdownToggle" 
            onClick={() => setIsDropdownOpen(o => !o)}
          >
            {currentSortLabel} 
            <ChevronDown size={14} className={`dropdownArrow ${isDropdownOpen ? "open" : ""}`} />
          </button>
          {isDropdownOpen && (
            <div className="dropdownMenu">
              {dropdownItems.map(item => (
                <button
                  key={item.key}
                  className={`dropdownItem ${sortOrder === item.key ? "active" : ""}`}
                  onClick={() => {
                    setSortOrder(item.key);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── ITEMS GRID ── */}
        <div className="itemsContainer">
          {loading ? (
            <div className="loadingState">
              <div className="spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : fetchError ? (
            <div className="errorState">
              <AlertTriangle size={28} className="errorIcon" />
              <h3>Failed to load reports</h3>
              <p>{fetchError}</p>
              <button className="retryBtn" onClick={fetchItems} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={16} /> Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="emptyState" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <SearchX size={32} color="var(--text-muted)" />
              <span>No items found in this category.</span>
            </div>
          ) : (
            <div className="grid">
              {filtered.map(item => {
                const descriptionPreview = truncateText(item.description, 60);
                
                return (
                  <div key={item._id} className={`itemCard ${isAdmin ? "adminCard" : ""}`} onClick={() => setSelected(item)}>
                    {item.image
                      ? (
                        <button
                          type="button"
                          className="imageButton itemImageButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage({ src: item.image, alt: item.title });
                          }}
                          aria-label={`View larger image of ${item.title}`}
                        >
                          <img src={item.image} className="itemImg" alt={item.title} />
                        </button>
                      )
                      : <div className="imgPlaceholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} color="var(--text-muted)" /></div>}

                    <div className="itemCardTop">
                      <h3>{item.title}</h3>
                      <span className={`badge-type ${item.type}`}>{item.type}</span>
                    </div>

                    <p className="itemDesc">{descriptionPreview}</p>
                    <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Found at: {item.location}</div>
                    {item.pickupLocation && <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> Pickup: {item.pickupLocation}</div>}

                    {isAdmin && item.claimer?.name && (
                      <div className="claimerInfo" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <User size={14} /> Claimer: {item.claimer.name} {item.claimer.phone && <><Phone size={14} style={{ marginLeft: '4px' }} /> {item.claimer.phone}</>}
                      </div>
                    )}

                    {isAdmin && item.owner?.name && (
                      <div className="reporterInfo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ClipboardList size={14} /> Reported by: {item.owner.name}</div>
                    )}

                    {isAdmin && item.adminDescription && (
                      <div className="privateCardInfo">Admin note: {truncateText(item.adminDescription, 70)}</div>
                    )}

                    {isAdmin && item.claimer?.description && (
                      <div className="privateCardInfo claimCardInfo">Claim note: {truncateText(item.claimer.description, 70)}</div>
                    )}

                    {item.status === "pending" && <span className="badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock3 size={12} /> Pending Approval</span>}
                    {item.status === "claimed" && <span className="badge-claimed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Claimed</span>}
                    {item.status === "resolved" && <span className="badge-resolved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Archive size={12} /> Resolved</span>}

                    {isAdmin && item.status === "pending" && (
                      <div className="adminActions">
                        <button 
                          className="approveBtn" 
                          onClick={(e) => { e.stopPropagation(); doAdminAction(item._id, "approve"); }}
                          disabled={busy === item._id}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><CheckCircle size={14} /> Approve</span>
                        </button>
                        <button 
                          className="rejectBtn" 
                          onClick={(e) => { e.stopPropagation(); doAdminAction(item._id, "reject"); }}
                          disabled={busy === item._id}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><XCircle size={14} /> Reject</span>
                        </button>
                      </div>
                    )}

                    {isAdmin && item.status === "claimed" && (
                      <button 
                        className="resolveBtn" 
                        onClick={(e) => { e.stopPropagation(); handleResolve(item); }}
                        disabled={busy === item._id}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Archive size={14} /> Resolve</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button 
                        className="deleteBtn" 
                        onClick={(e) => { e.stopPropagation(); handleAdminDelete(item._id); }}
                        disabled={busy === item._id}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Trash2 size={14} /> Delete</span>
                      </button>
                    )}

                    {!isAdmin && item.type === "found" && item.status === "available" && (
                      isReporterOfFoundItem(item) ? (
                        <div className="reporterClaimMessage" style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-muted)', 
                          fontStyle: 'italic',
                          textAlign: 'center', 
                          padding: '4px',
                          border: '1px dashed var(--text-muted)',
                          borderRadius: '4px',
                          width: '100%',
                          marginTop: '4px'
                        }}>
                          You reported this item. Only other users can claim it.
                        </div>
                      ) : (
                        <button className="claimBtn" onClick={(e) => { e.stopPropagation(); setClaimTarget(item); }}>
                          Claim Item
                        </button>
                      )
                    )}
                    {isOwnReport(item) && (
                      getEditTimeLeft(item) > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: '4px' }}>
                          <button
                            className="editBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(item);
                              setEditForm({
                                title: item.title,
                                description: item.description,
                                location: item.location,
                                dateOccurred: item.dateOccurred ? new Date(item.dateOccurred).toISOString().split("T")[0] : "",
                                category: item.category || "Other",
                                image: item.image || "",
                                adminDescription: item.adminDescription || "",
                                type: item.type
                              });
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Pencil size={14} /> Edit Report</span>
                          </button>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
                            {Math.ceil(getEditTimeLeft(item) / 60000)}m left
                          </span>
                        </div>
                      ) : (
                        <button className="editBtn" disabled style={{ opacity: 0.6, cursor: 'not-allowed', width: '100%', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Lock size={14} /> Edit Expired</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {showLostForm && FormModal({ type: "lost", onClose: () => setShowLostForm(false) })}
      {showFoundForm && FormModal({ type: "found", onClose: () => setShowFoundForm(false) })}
      {editTarget && EditModal({ item: editTarget, onClose: () => setEditTarget(null) })}
      {selected && DetailModal({ item: selected, onClose: () => setSelected(null) })}
      {showTimeoutWarning && TimeoutWarningModal()}
      {selectedImage && (
        <div className="modal imageModal" onClick={() => setSelectedImage(null)}>
          <div className="imageModalBox" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <button className="cancelBtn" onClick={() => setSelectedImage(null)}>Close</button>
          </div>
        </div>
      )}
      {claimTarget && ClaimModal()}
      {settingsOpen && SettingsModal()}

      {/* ── RESOLVE PICKUP POPUP ── */}
      {resolveTarget && (
        <div className="modal resolvePopupOverlay" onClick={() => { setResolveTarget(null); }}>
          <div className="resolvePopupBox" onClick={e => e.stopPropagation()}>
            <div className="resolvePopupHeader">
              <Send size={28} className="resolvePopupIcon" />
              <div>
                <h3 className="resolvePopupTitle">Send Pickup Location</h3>
                <p className="resolvePopupSub">This message will be sent to the claimer's notification bar</p>
              </div>
            </div>

            <div className="resolveItemInfo">
              <div className="resolveItemRow">
                <span className="resolveInfoLabel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} /> Item</span>
                <span className="resolveInfoValue">{resolveTarget.title}</span>
              </div>
              {resolveTarget.claimer?.name && (
                <div className="resolveItemRow">
                  <span className="resolveInfoLabel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> Claimer</span>
                  <span className="resolveInfoValue">{resolveTarget.claimer.name}</span>
                </div>
              )}
              {resolveTarget.claimer?.phone && (
                <div className="resolveItemRow">
                  <span className="resolveInfoLabel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> Phone</span>
                  <span className="resolveInfoValue">{resolveTarget.claimer.phone}</span>
                </div>
              )}
            </div>

            <div className="resolveFormGroup">
              <label className="resolveLabel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Pickup Location *</label>
              <input
                className="resolveInput"
                placeholder="e.g. Administration Office, Room 12, Ground Floor"
                value={resolvePickupLocation}
                onChange={e => setResolvePickupLocation(e.target.value)}
              />
            </div>

            <div className="resolveFormGroup">
              <label className="resolveLabel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} /> Collection Instructions (Optional)</label>
              <textarea
                className="resolveTextarea"
                placeholder="e.g. Please bring your ID. Available Mon–Fri 9am–5pm."
                value={resolveInstructions}
                onChange={e => setResolveInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="resolvePreview">
              <span className="resolvePreviewLabel">Preview notification:</span>
              <p className="resolvePreviewText">
                Your claim for "{resolveTarget.title}" has been resolved! — Pickup location: {resolvePickupLocation || "(enter location above)"}{resolveInstructions ? ` — ${resolveInstructions}` : ""}
              </p>
            </div>

            <div className="resolveActions">
              <button
                className="resolveSendBtn"
                onClick={submitResolve}
                disabled={resolveSubmitting || !resolvePickupLocation.trim()}
              >
                {resolveSubmitting ? "Sending…" : <><CheckCircle size={16} style={{verticalAlign:'middle', marginRight:'4px'}} /> Send & Mark as Resolved</>}
              </button>
              <button
                className="cancelBtn"
                onClick={() => setResolveTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
