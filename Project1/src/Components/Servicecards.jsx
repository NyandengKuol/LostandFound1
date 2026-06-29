export default function ServiceCard({title, description}){

   return(
      <div className="card">
         <h2 className="cardHeading">{title}</h2>
         <p className="serviceDescription">{description}</p>
      </div>
   )
}
