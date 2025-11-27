import axios from "axios";
import {  createContext, useContext, useState } from "react";

import { HttpStatusCode } from "axios";
import server from "../environment";
export const AuthContext = createContext({});

const client = axios.create({
    baseURL : `${server}/api/v1/users`
})

export const AuthProvider = ({children}) =>{
    const authContext = useContext(AuthContext);
   
    const [userData,setUserData] = useState(authContext);
      

    const handleRegister = async(name,username,password)=>{
        try{
            let request = await client.post("/register",{
                name:name,
                username:username,
                password:password
            })
            if(request.status === HttpStatusCode.Created){
                return request.data.message;
            }
        }catch(err){
                throw err;
            }
    }
    const handleLogin = async(username,password)=>{
        try{
          let request = await client.post("/login",{
            username:username,
            password:password
          });
          console.log("LOGIN RESPONSE:", request.status, request.data);
          if(request.status === HttpStatusCode.OK){
            localStorage.setItem("token",request.data.token);
            console.log("ok")
            return true;
          }
        }catch(err){
      throw err;
        }
    }

     
  



    const getHistoryOfUser = async ()=>{
      try {
        let request = await client.get("/get_all_activity",{
          params:{
            token : localStorage.getItem("token")
          }
        });
        return request.data
      } catch (error) {
            throw error;
      }
    }

    const addToUserHistory = async(meetingCode) =>{
       
      try {
        let req = await client.post("/add_to_activity",{
          token: localStorage.getItem("token"),
          meeting_code : meetingCode
        })
        return req;
      } catch (error) {
        throw error;
      }
    }
      
    
    
    const data = {
        userData,setUserData,handleRegister,handleLogin,getHistoryOfUser,addToUserHistory
    }
    return(
     <AuthContext.Provider value={data}>
     {children}
     </AuthContext.Provider>   
    )

}
