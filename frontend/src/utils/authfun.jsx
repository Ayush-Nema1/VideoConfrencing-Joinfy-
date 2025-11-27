import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrapComponent)=>{
    const AuthComponent = (props) =>{
        const router = useNavigate();
    const isAuthenticate = ()=>{
        if(localStorage.getItem("token")){
            return true;
        }
        return false;
    }
    useEffect(()=>{
        if(!isAuthenticate()){
            router("/auth")
        }
    },[])
       return <WrapComponent {...props}/>    
}
return AuthComponent;
}

export default withAuth;