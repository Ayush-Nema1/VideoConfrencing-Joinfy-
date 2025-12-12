import './App.css'
import {Route, BrowserRouter as Router,Routes} from 'react-router'
import LandingPage from './pages/landing'
import Authentication from './pages/authentication'
import { AuthProvider } from './contexts/AuthContext'
import Videomeet from './pages/Videomeet'
import HomeComponent from './pages/homeComponent.jsx'
import History from './pages/History.jsx'
import ProtectedRoute from './pages/ProtectedComponent.jsx';

function App() {

  return (
   <>
     <AuthProvider>
   <Router>
  
     <Routes> 
      <Route path ='/' element = {<LandingPage/>}/>
      <Route path ='/auth' element = {<Authentication/>}/>
      <Route path='/home' element= { <ProtectedRoute>
                  <HomeComponent/>
                </ProtectedRoute>}/>
      <Route path = "/history" element = {<ProtectedRoute>
                  <History/>
                </ProtectedRoute>
}/>
      <Route path='/:url' element={<ProtectedRoute>
                  <Videomeet/>
                </ProtectedRoute>
}/>
     </Routes>
   
   </Router>
     </AuthProvider>
   </>
  )
}

export default App
