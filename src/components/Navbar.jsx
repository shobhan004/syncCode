import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const Navbar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            navigate('/');
        } catch (err) {
            toast.error("Logout failed!");
        }
    };

    return (
        <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* Logo Section */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-2 rounded-xl group-hover:rotate-12 transition-all duration-300">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">
                        Sync<span className="bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent italic">Code</span>
                    </span>
                </div>

                {/* Action Section */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-5">
                            {/* Profile Chip */}
                           {/* Profile Chip wala part aise update kar */}
<div className="flex items-center gap-3 bg-white/[0.05] p-1 pr-4 rounded-full border border-white/10">
    {user?.photoURL ? (
        <img 
            src={user.photoURL} 
            alt="profile" 
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-purple-500/50 object-cover"
            // ✅ Magic Tip: Agar photo load na ho (404), toh default avatar dikhao
            onError={(e) => { 
                e.target.onerror = null; // Infinite loop rokne ke liye
                e.target.src = `https://ui-avatars.com/api/?name=${user?.email}`;
                }}
        />
    ) : (
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg shadow-purple-500/20">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
        </div>
    )}
    <span className="text-slate-200 text-xs font-bold tracking-tight">
        {/* ✅ Display name nahi hai toh email ka prefix dikhao */}
        {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || "User"}
    </span>
</div>

                            {/* Logout */}
                            <button 
                            className='relative group overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-95 flex items-center gap-2' 
                            onClick={handleLogout}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>Log Out</span>
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        </div>
                    ) : (
                        <button 
                            className='relative group overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-95 flex items-center gap-2' 
                            onClick={() => navigate('/auth')}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>Log in</span>
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;