import './App.css'
import {Route, BrowserRouter as Router,Routes} from 'react-router'
import LandingPage from './pages/landing'
import Authentication from './pages/authentication'
import { AuthProvider } from './contexts/AuthContext'
import Videomeet from './pages/Videomeet'
import HomeComponent from './pages/homeComponent.jsx'
import History from './pages/History.jsx'
function App() {

  return (
   <>
     <AuthProvider>
   <Router>
  
     <Routes> 
      <Route path ='/' element = {<LandingPage/>}/>
      <Route path ='/auth' element = {<Authentication/>}/>
      <Route path='/home' element= {<HomeComponent/>}/>
      <Route path = "/history" element = {<History/>}/>
      <Route path='/:url' element={<Videomeet/>}/>
     </Routes>
   
   </Router>
     </AuthProvider>
   </>
  )
}

export default App
