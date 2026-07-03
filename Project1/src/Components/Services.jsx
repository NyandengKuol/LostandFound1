import ServiceCard from './Servicecards'
import servicesBg from '../assets/services-bg.png'

export default function Services(){

    return(
        <section id="services" className="services">

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

            <div className="servicecards">
                <ServiceCard 
                title="Report Lost Items"
                description="Please report items here"
                />

                <ServiceCard
                title="Retrieve Items"
                description="Claim lost items"
                />

                <ServiceCard
                title="Community Support"
                description="Volunteers are needed"
                />
            </div>
        </section>
    )
}
