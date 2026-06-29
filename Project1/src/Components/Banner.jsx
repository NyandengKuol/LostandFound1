import lostfound from '../assets/lostandfound.png'

export default function Banner(){

    return(
    <section id="home" className="banner">
        <img src={lostfound} alt="Banner image" className="imageBanner"/>

        <div className="bannerText">
            <h1>Welcome to the lost and found app</h1>
            <p>Search and report lost items here</p>
        </div>

    </section>
    )

}
