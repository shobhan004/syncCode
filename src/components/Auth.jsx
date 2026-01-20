import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';

function Auth() {
    const [isSignup, setIsSignup] = useState(false); // Default Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            if (isSignup) {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                toast.success(`Welcome ${email.split('@')[0]}! Account created.`);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back!");
            }
            navigate('/'); 
        } catch (err) {
            toast.error(err.message);
        }
    };

   const handleGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user; // ✅ Pehle user define karo

        // Google ki low-res photo ko HD mein badlo
        const highResPhoto = user.photoURL.replace('=s96-c', '=s400-c');

        // ✅ Firebase ko force karo ye photo save karne ke liye
        await updateProfile(user, {
            photoURL: highResPhoto
        });

        toast.success(`Welcome ${user.displayName}!`);
        
        // Sabse zaroori: Redirect ke saath page reload taaki Navbar refresh ho jaye
        window.location.href = "/"; 
        
    } catch (err) {
        console.error(err);
        toast.error("Google Login Failed");
    }
};

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-15%] w-[70%] h-[70%] bg-purple-900/10 blur-[130px] rounded-full opacity-50" />

            <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 italic">
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isSignup ? "Join the community of elite developers." : "Login to sync your workspace."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white outline-none focus:ring-1 ring-purple-500 transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white outline-none focus:ring-1 ring-purple-500 transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                        {isSignup ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative bg-[#0b0b0b] px-4 text-xs uppercase text-slate-500 tracking-widest">Or continue with</span>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-semibold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.63H24v9.3h12.91c-.58 2.85-2.2 5.31-4.59 7.03l7.39 5.73c4.35-4.04 6.87-10.04 6.87-16.71z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.39-5.73c-2.11 1.41-4.82 2.24-8.5 2.24-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Google Login</span>
                </button>

                <p className="text-center mt-8 text-sm text-slate-500">
                    {isSignup ? "Already have an account?" : "New to SyncCode?"}
                    <button onClick={() => setIsSignup(!isSignup)} className="ml-2 text-purple-400 font-bold hover:underline transition-all">
                        {isSignup ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;