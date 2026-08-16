import { Link } from 'react-router-dom';

export default function ServiceCard({
  frontIcon,
  frontTitle,
  frontDesc,
  backTitle,
  backDesc,
  buttonText,
  buttonLink
}) {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front card">
          <div className="cardIcon">{frontIcon}</div>
          <h2 className="cardHeading">{frontTitle}</h2>
          <p className="serviceDescription">{frontDesc}</p>
        </div>
        
        {/* Back */}
        <div className="flip-card-back card">
          <h2 className="cardHeading">{backTitle}</h2>
          <p className="serviceDescription">{backDesc}</p>
          <Link to={buttonLink} className="cardButton">
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
