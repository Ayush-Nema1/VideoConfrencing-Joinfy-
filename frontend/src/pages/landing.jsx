import React from 'react'
import { Link } from 'react-router-dom';
export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className="navHeader"> <h2 style={{color:"aqua",fontSize:"50px"}}> Joinfy </h2></div>
        <div className="navlist">
          <p style={{fontSize: "20px"}}> Join as Guest</p>
          <p style={{fontSize: "20px"}}>Register</p>
          <div className="button">
            <p style={{fontSize: "20px"}}>Login</p>
          </div>
        </div>
      </nav>
      <div className="landingMainContainer">
        <div className='leftmain'>
          <h2 className='myh2'>Your people are one click away,</h2>
          <h4>Bring everyone together with one click.</h4>
          
          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div className='rightimg'>
          <img src="/Videocall-bro.png" className = "setshadow"alt="" srcset="" />
        </div>
      </div>
    </div>
  )
}
