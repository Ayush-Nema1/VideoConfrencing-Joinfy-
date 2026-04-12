import React, { useContext, useState } from 'react'
import withAuth from '../utils/authfun';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import { IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import RestoreIcon from '@mui/icons-material/Restore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { AuthContext } from '../contexts/AuthContext';


function HomeComponent() {
let navigate = useNavigate();
const [meetingCode , setmeetingCode] = useState("");
const {addToUserHistory} = useContext(AuthContext);
let handleJoinVideoCall = async ()=>{
  await addToUserHistory(meetingCode)
    navigate(`/youarejoinon/${meetingCode}`);
}

  return (
    <div className='Home'>
      <div className="navBar">
       
       <div className="C1" >
        <h3 >  Joinfy</h3>
       </div>
        <div className="C2">
          <IconButton  onClick ={()=>{
              
              navigate("/history")
            }} > 
            <RestoreIcon style={{color:"lightgreen",marginRight:"5px"}}/>
              <p style={{color:"lightgreen"}}>History</p>
            </IconButton>
            <IconButton  onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }} style={{marginLeft:"5px"}}>
              <LogoutIcon  style={{color:"lightBlue",marginRight:"5px"}}/>
              <p style={{color:"lightblue"}}>Logout</p>
            </IconButton>
        </div>
        </div>
        <div className="mainContainer">
          <div className="left" >
            <div className="headings">
            <h2 style={{color:"#B388FF",fontSize:"60px"}}>Your people are one click away,</h2>
            <h4 style={{color:"white",fontSize:"40px",padding:"5px"}}>Bring everyone together with one click.</h4>
            </div>
            <div className="in">
            <input type="text" placeholder='Enter meeting code' onChange={e => setmeetingCode(e.target.value) }  />
            
            <IconButton onClick={handleJoinVideoCall} id= "Btnn" > Join <KeyboardArrowRightIcon/> </IconButton>
              </div>
          </div>
          <div className="right">
                 <img src="home.png"  />
          </div>
        </div>
    </div>
  )
}

export default   withAuth(HomeComponent);