import React from 'react'
import { Link,useNavigate } from 'react-router-dom';

export default function LandingPage() {
 
    const router = useNavigate();
      
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className="navHeader"> <h2 style={{color:"aqua",fontSize:"50px"}}> Joinfy </h2></div>
        <div className="navlist">
          <p style={{fontSize: "20px"}} onClick={()=>{
            router("/meetyourfrienid8855")
          }}  > Join as Guest</p>
          <p style={{fontSize: "20px"}}   onClick={() => {
                        router("/auth")

                    }}  >Register</p>
          <div className="button">
            <p style={{fontSize: "20px"}}  onClick={() => {
                        router("/auth")

                    }} >Login</p>
          </div>
        </div>
      </nav>
      <div className="landingMainContainer">
        <div className='leftmain'>
          <h2 className='myh2'>Your people are one click away,</h2>
          <h4>Bring everyone together with one click.</h4>
          
          <div role="button" onClick={()=>{
            router("meetyourfrienid8855")
          }} >
            <Link >Get Started</Link>
          </div>
        </div>
        <div className='rightimg'>
          <img src="/Videocall-bro.png" className = "setshadow"alt="" srcset="" />
        </div>
      </div>
    </div>
  )
}
