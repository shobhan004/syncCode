'use client';
import React, { useState } from "react"; // ✅ useState yahan add kiya
import { useNavigate } from "react-router-dom";
// import { auth, provider } from "../firebase";
// import { signInWithPopup } from "firebase/auth";
import Navbar from "../components/Navbar"; 
import { ShootingStars } from "../components/ui/shadcn-io/shooting-stars";
import HomeCard from "../components/HomeCard";
import toast from "react-hot-toast"; // ✅ Toast import check kar lena
import Footer from "../components/Footer";
import Feature from "../components/Feature";
import Review from "../components/Review";

const Home = ({user}) => {
   // ✅ YE WALI LINE MISSING THI!

  // const handleGoogleLogin = async () => {
  //   try {
  //       const result = await signInWithPopup(auth, provider);
  //       const loggedInUser = result.user; 

  //       const highResPhoto = user.photoURL.replace('=s96-c', '=s400-c');

  //       setUser({loggedInUser , photoURL: highResPhoto}); // ✅ State update karo taaki Navbar mein dikhe
  //       setUsername(loggedInUser.displayName); // Input field ke liye

  //       toast.success(`Welcome ${loggedInUser.displayName.split(' ')[0]}!`);
  //   } catch (error) {
  //       console.error("Auth Error:", error);
  //       toast.error("Google login failed!");
  //   }
  // };

  return (
    <div className="relative min-h-screen w-full bg-[#020202] overflow-hidden font-sans">
      
      {/* Intense Professional Purple Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[90%] bg-purple-700/30 blur-[150px] rounded-full opacity-60" />
         <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-indigo-600/10 blur-[130px] rounded-full" />
         <ShootingStars />
      </div>

      {/* ✅ Ab 'user' undefined nahi aayega */}
      <Navbar user={user} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 h-screen flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Professional Hero Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-300 text-[10px] font-black uppercase tracking-[3px]">Enterprise Grade Collaboration</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85] mb-8">
            Sync Code
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Empower Teams.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
            Experience the next generation of real-time pair programming. High-performance code synchronization with integrated AI assistance.
          </p>
        </div>

        {/* Right Side: HomeCard */}
        <div className="flex-1 w-full max-w-[460px] relative z-20">
           <div className="absolute -inset-10 bg-purple-600/20 rounded-full blur-[100px] opacity-100" />
           <div className="relative">
              <HomeCard />
           </div>
        </div>
      </main>
      <Feature></Feature>
      <div className="relative z-10">
        <Review user={user} />
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Home; 