import { Link } from 'react-router-dom';
import { ClipboardList, PackageSearch, HandHeart, ArrowRight } from 'lucide-react';
import ServiceCard from './Servicecards';
import servicesBg from '../assets/services-bg.png';

export default function Services() {
  return (
    <div className="services-page">
      {/* HERO BANNER */}
      <div className="servicesHeroBanner" style={{ backgroundImage: `url(${servicesBg})` }}>
        <div className="servicesHeroOverlay">
          <span className="servicesHeroBadge">WHAT WE OFFER</span>
          <h1 className="servicesHeroTitle">Our Services</h1>
          <p className="servicesHeroSub">
            Powerful tools to help you report, find, and reclaim lost items — faster than ever.
          </p>
        </div>
      </div>

      {/* SERVICES FLIP CARDS */}
      <section className="services-section">
        <div className="servicecards">
          <ServiceCard 
            frontIcon={<ClipboardList size={36} />}
            frontTitle="Report Lost Items"
            frontDesc="Report belongings you've lost and provide useful details to help identify them."
            backTitle="Report Lost Items"
            backDesc="Easily report a lost item by providing its name, category, description, location, date, and an image. You can then track the status of your report from your dashboard."
            buttonText="Sign Up to Report"
            buttonLink="/signup"
          />

          <ServiceCard
            frontIcon={<PackageSearch size={36} />}
            frontTitle="Find & Retrieve Items"
            frontDesc="Search through found items and submit a claim to recover your belongings."
            backTitle="Find & Retrieve Items"
            backDesc="Browse approved found-item reports and use search and filtering to help locate your belongings. Once you find a possible match, you can submit a claim for verification."
            buttonText="Login to Claim"
            buttonLink="/login"
          />

          <ServiceCard
            frontIcon={<HandHeart size={36} />}
            frontTitle="Community Support"
            frontDesc="Help reunite people with their lost belongings."
            backTitle="Community Support"
            backDesc="Found something that doesn't belong to you? Reporting it can help return it to its rightful owner and make the community safer. Every found-item report can make a difference."
            buttonText="Report a Found Item"
            buttonLink="/signup"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="how-it-works-header">
          <span className="section-badge">HOW IT WORKS</span>
          <h2 className="section-title">Three Simple Steps</h2>
          <p className="section-sub">From reporting to recovery — we make it easy.</p>
        </div>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Report</h3>
            <p className="step-desc">Submit details about a lost or found item, including its description, location, date, and image.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Search & Verify</h3>
            <p className="step-desc">Browse reported items to find potential matches. Claims are reviewed and verified to help ensure that items are returned to their rightful owners.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Recover</h3>
            <p className="step-desc">Once a claim has been verified, the rightful owner can proceed with recovering their lost belongings.</p>
          </div>
        </div>
      </section>

      {/* READY TO GET STARTED */}
      <section className="ready-to-start">
        <div className="ready-content">
          <span className="section-badge light">READY TO GET STARTED?</span>
          <h2 className="ready-title">Reconnect With What Matters</h2>
          <p className="ready-sub">
            Create an account to report lost or found items, search for belongings, submit claims, and help others recover their possessions.
          </p>
          <div className="ready-actions">
            <Link to="/signup" className="ready-btn primary">Sign Up</Link>
            <Link to="/login" className="ready-btn secondary">Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
