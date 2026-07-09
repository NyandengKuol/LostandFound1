import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { apiUrl } from "../api";
import "./Dashboard.css";

const API = apiUrl("/api/reports");

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
    fetchItems();
    const saved = localStorage.getItem("seenNotifications");
    if (saved) setSeenNotifications(readStoredList("seenNotifications"));
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
        owner: { name: user.username || "Anonymous", email: user.email || "" } 
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

  const markAsSeen = (id) => {
    setNotifications(prev => {
      const updated = prev.map((n, index) => {
        const item = normalizeNotification(n, index);
        return item.id === id ? { ...item, seen: true } : item;
      });
      localStorage.setItem("dashboard_notifications", JSON.stringify(updated));
      return updated;
    });
    setSeenNotifications(prev => {
      const updated = Array.from(new Set([...prev, id]));
      localStorage.setItem("seenNotifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsSeen = () => {
    const allIds = notifications.map((n, index) => normalizeNotification(n, index).id);
    setNotifications(prev => {
      const updated = prev.map((n, index) => ({ ...normalizeNotification(n, index), seen: true }));
      localStorage.setItem("dashboard_notifications", JSON.stringify(updated));
      return updated;
    });
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

  /* ── CLAIM ── */
  const submitClaim = async () => {
    if (!claimerInfo.name || !claimerInfo.phone || !claimerInfo.description) {
      alert("Please fill in your name, phone, and claim description.");
      return;
    }
    try {
      const res = await fetch(`${API}/${claimTarget._id}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimer: claimerInfo })
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
            <button className="removeImg" onClick={() => { setForm(f => ({ ...f, image: "" })); setImageFile(null); }}>✕ Remove</button>
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
          )
          : <div className="imgPlaceholder" style={{height:160}}>📦</div>}

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
          <span>📍 {item.location}</span>
          <span>📅 {item.dateOccurred ? new Date(item.dateOccurred).toLocaleDateString() : "—"}</span>
          <span>🏷️ {item.category || "Other"}</span>
          {item.owner?.name && <span>👤 Reported by {item.owner.name}</span>}
        </div>

        {isAdmin && item.status === "pending" && (
          <div className="adminActions">
            <button 
              className="approveBtn" 
              onClick={() => doAdminAction(item._id, "approve")}
              disabled={busy === item._id}
            >
              ✅ Approve Claim
            </button>
            <button 
              className="rejectBtn" 
              onClick={() => doAdminAction(item._id, "reject")}
              disabled={busy === item._id}
            >
              ❌ Reject Claim
            </button>
          </div>
        )}

        {isAdmin && item.status === "claimed" && (
          <button 
            className="resolveBtn" 
            onClick={() => doAdminAction(item._id, "resolve")}
            disabled={busy === item._id}
          >
            🗂️ Mark as Resolved
          </button>
        )}

        {isAdmin && (
          <button 
            className="deleteBtn" 
            onClick={() => handleAdminDelete(item._id)}
            disabled={busy === item._id}
          >
            🗑️ Delete Report
          </button>
        )}

        {!isAdmin && item.type === "found" && item.status === "available" && (
          <button className="claimBtn" onClick={() => { setClaimTarget(item); onClose(); }}>
            Claim This Item
          </button>
        )}
        {!isAdmin && item.status === "pending" && (
          <div className="pendingNote">⏳ Claim pending admin approval</div>
        )}
        {!isAdmin && item.status === "claimed" && (
          <div className="claimedNote">✅ This item has been claimed</div>
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
          <h3>⚙️ Settings</h3>
          <button className="closeSettingsBtn" onClick={() => setSettingsOpen(false)}>✕</button>
        </div>

        <div className="settingsTabs">
          <button
            className={`settingsTabBtn ${settingsTab === "profile" ? "active" : ""}`}
            onClick={() => setSettingsTab("profile")}
          >
            👤 Profile
          </button>
          <button
            className={`settingsTabBtn ${settingsTab === "settings" ? "active" : ""}`}
            onClick={() => setSettingsTab("settings")}
          >
            🔧 Settings
          </button>
          <button
            className={`settingsTabBtn ${settingsTab === "theme" ? "active" : ""}`}
            onClick={() => setSettingsTab("theme")}
          >
            🎨 Theme
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
                  <span className={`roleChip ${isAdmin ? "admin" : ""}`}>
                    {isAdmin ? "👑 Admin" : "👤 User"}
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
                  <span>☀️ Light</span>
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
                  <span>🌙 Dark</span>
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

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebarBrand">
          <span className="brandIcon">🔍</span>
          <h2>Lost & Found</h2>
        </div>

        <div className="sidebarNav">
          <button className="sidebarBtn" onClick={() => { setForm({...emptyForm, type:"lost"}); setShowLostForm(true); }}>
            <span className="sidebarIcon">➕</span> Report Lost
          </button>
          <button className="sidebarBtn" onClick={() => { setForm({...emptyForm, type:"found"}); setShowFoundForm(true); }}>
            <span className="sidebarIcon">🔍</span> Report Found
          </button>
        </div>

        {isAdmin && (
          <div className="adminBadgeSidebar">👑 Admin Mode</div>
        )}

        <div className="sidebarFooter">
          <button className="sidebarBtn logout" onClick={() => { 
            localStorage.clear(); 
            navigate("/login"); 
          }}>
            <span className="sidebarIcon">🚪</span> Logout
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="userCard">
            <div className="userInfo">
              <span className="userName">👤 {user?.username || "Nyandeng"}</span>
              <span className={`roleTag ${isAdmin ? "adminTag" : ""}`}>
                {isAdmin ? "👑 Admin" : "User"}
              </span>
            </div>
          </div>

          <div className="topCenter">
            <div className="searchWrap">
              <span className="searchIcon">🔎</span>
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
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <div className="notif" ref={notifRef}>
              <button
                type="button"
                className="notifButton"
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
              >
                🔔
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
                      <button type="button" className="closeNotif" onClick={() => setNotifOpen(false)}>×</button>
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
                <span className={`dropdownArrow ${profileOpen ? "open" : ""}`}>▼</span>
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
                  <button type="button" onClick={() => { setSettingsTab("profile"); setSettingsOpen(true); setProfileOpen(false); }}>
                    👤 Profile
                  </button>
                  <button type="button" onClick={() => { setSettingsTab("settings"); setSettingsOpen(true); setProfileOpen(false); }}>
                    ⚙️ Settings
                  </button>
                  <button type="button" onClick={() => { setSettingsTab("theme"); setSettingsOpen(true); setProfileOpen(false); }}>
                    🎨 Theme
                  </button>
                  <button
                    type="button"
                    className="dangerMenuItem"
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats">
          <div className="card statTotal" onClick={() => setActiveTab("all")}>
            <div className="statIcon">📊</div>
            <div className="statInfo">
              <span className="statValue">{counts.all}</span>
              <span className="statLabel">Total</span>
            </div>
          </div>
          <div className="card statLost" onClick={() => setActiveTab("lost")}>
            <div className="statIcon">🔴</div>
            <div className="statInfo">
              <span className="statValue">{counts.lost}</span>
              <span className="statLabel">Lost</span>
            </div>
          </div>
          <div className="card statFound" onClick={() => setActiveTab("found")}>
            <div className="statIcon">🟢</div>
            <div className="statInfo">
              <span className="statValue">{counts.found}</span>
              <span className="statLabel">Found</span>
            </div>
          </div>
          <div className="card statPending" onClick={() => setActiveTab("pending")}>
            <div className="statIcon">⏳</div>
            <div className="statInfo">
              <span className="statValue">{counts.pending}</span>
              <span className="statLabel">Pending</span>
            </div>
          </div>
          <div className="card statClaimed" onClick={() => setActiveTab("claimed")}>
            <div className="statIcon">✅</div>
            <div className="statInfo">
              <span className="statValue">{counts.claimed}</span>
              <span className="statLabel">Claimed</span>
            </div>
          </div>
          {isAdmin && (
            <div className="card statResolved" onClick={() => setActiveTab("resolved")}>
              <div className="statIcon">🗂️</div>
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
            <span className={`dropdownArrow ${isDropdownOpen ? "open" : ""}`}>▼</span>
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
              <span className="errorIcon">⚠️</span>
              <h3>Failed to load reports</h3>
              <p>{fetchError}</p>
              <button className="retryBtn" onClick={fetchItems}>🔄 Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="emptyState">📭 No items found in this category.</div>
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
                      : <div className="imgPlaceholder">📦</div>}

                    <div className="itemCardTop">
                      <h3>{item.title}</h3>
                      <span className={`badge-type ${item.type}`}>{item.type}</span>
                    </div>

                    <p className="itemDesc">{descriptionPreview}</p>
                    <div className="location">📍 {item.location}</div>

                    {isAdmin && item.claimer?.name && (
                      <div className="claimerInfo">
                        👤 Claimer: {item.claimer.name} {item.claimer.phone && `📞 ${item.claimer.phone}`}
                      </div>
                    )}

                    {isAdmin && item.owner?.name && (
                      <div className="reporterInfo">📋 Reported by: {item.owner.name}</div>
                    )}

                    {isAdmin && item.adminDescription && (
                      <div className="privateCardInfo">Admin note: {truncateText(item.adminDescription, 70)}</div>
                    )}

                    {isAdmin && item.claimer?.description && (
                      <div className="privateCardInfo claimCardInfo">Claim note: {truncateText(item.claimer.description, 70)}</div>
                    )}

                    {item.status === "pending" && <span className="badge-pending">⏳ Pending Approval</span>}
                    {item.status === "claimed" && <span className="badge-claimed">✅ Claimed</span>}
                    {item.status === "resolved" && <span className="badge-resolved">🗂️ Resolved</span>}

                    {isAdmin && item.status === "pending" && (
                      <div className="adminActions">
                        <button 
                          className="approveBtn" 
                          onClick={(e) => { e.stopPropagation(); doAdminAction(item._id, "approve"); }}
                          disabled={busy === item._id}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="rejectBtn" 
                          onClick={(e) => { e.stopPropagation(); doAdminAction(item._id, "reject"); }}
                          disabled={busy === item._id}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {isAdmin && item.status === "claimed" && (
                      <button 
                        className="resolveBtn" 
                        onClick={(e) => { e.stopPropagation(); doAdminAction(item._id, "resolve"); }}
                        disabled={busy === item._id}
                      >
                        🗂️ Resolve
                      </button>
                    )}

                    {isAdmin && (
                      <button 
                        className="deleteBtn" 
                        onClick={(e) => { e.stopPropagation(); handleAdminDelete(item._id); }}
                        disabled={busy === item._id}
                      >
                        🗑️ Delete
                      </button>
                    )}

                    {!isAdmin && item.type === "found" && item.status === "available" && (
                      <button className="claimBtn" onClick={(e) => { e.stopPropagation(); setClaimTarget(item); }}>
                        Claim Item
                      </button>
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
      {selected && DetailModal({ item: selected, onClose: () => setSelected(null) })}
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
    </div>
  );
}
