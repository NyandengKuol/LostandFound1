import ServiceCard from './Servicecards'

export default function Services(){

    return(
        <section id="services" className="services">
            <h1 className="sectionTitle"> Our Services</h1>

            <div className="servicecards">
                <ServiceCard 
                title= "Report Lost Items"
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
