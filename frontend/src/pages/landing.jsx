import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./landing.css";
export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      {/* NAVBAR */}

      <nav className="navBar">
        <div className="navHeader">
          <h2 className="logo">Joinfy</h2>
        </div>

        <div className="navlist">
          <p
            onClick={() => {
              const meetingId = Math.floor(100000 + Math.random() * 900000)
              router(`/youarejoinon/${meetingId}`);
            }}
          >
            Join as Guest
          </p>

          <p
            onClick={() => {
              router("/auth");
            }}
          >
            Register
          </p>

          <div className="button">
            <p
              onClick={() => {
                router("/auth");
              }}
            >
              Login
            </p>
          </div>
        </div>
      </nav>

      {/* MAIN SECTION */}

      <div className="landingMainContainer">
        {/* LEFT */}

        <div className="leftmain">
          <h2 className="myh2">Your people are one click away,</h2>

          <h4>Bring everyone together with one click.</h4>

          <div
            className="getStartedBtn"
            role="button"
            onClick={() => {
              const meetingId = Math.floor(100000 + Math.random() * 900000)
router(`/youarejoinon/${meetingId}`);
            }}
          >
            <Link>Get Started</Link>
          </div>
        </div>

        {/* RIGHT */}

        <div className="rightimg">
            <div className="wave"></div>
          <img
            src="/Videocall-bro.png"
            className="setshadow"
            alt="video call"
          />
        </div>
      </div>
    </div>
  );
}
