import React, { useState , useEffect } from 'react'
import Home from './pages/home'
import {Toaster} from 'react-hot-toast'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Editor from './pages/Editor'
import { Route  , Routes} from 'react-router-dom'
import Auth from './components/Auth'

function App() {
  const [user , setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ye function check karega ki user login hai ya nahi
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    
    <div>
    <Toaster
      position='top-center' 
      toastOptions={{
        success : {
        theme:{
          primary : "#008000"
        }
        }
      }}
    />
    <Routes>
      <Route path='/' element = {<Home user = {user}></Home>}></Route>
      <Route path='/editor/:roomId' element = {<Editor></Editor>}></Route>
      <Route path='/auth' element = {<Auth></Auth>}></Route>
    </Routes>
    
    </div>
  )
}

export default App
