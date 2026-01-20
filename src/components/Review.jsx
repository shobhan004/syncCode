import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Review = ({ user }) => {
    const [reviewText, setReviewText] = useState('');
    const [allReviews, setAllReviews] = useState([]);

    // ✅ Logic: Database se saare reviews fetch karna
    useEffect(() => {
        const reviewsRef = ref(db, 'reviews');
        onValue(reviewsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const reviewsArray = Object.values(data).reverse(); // Latest reviews pehle
                setAllReviews(reviewsArray);
            }
        });
    }, []);

    // ✅ Logic: Naya review bhejni ki koshish
    const submitReview = async () => {
    // 1. Check karo user hai ya nahi
    if (!user) {
        return toast.error("Bhai, pehle login toh karlo!");
    }

    if (!reviewText.trim()) {
        return toast.error("Bhai, kuch toh likh!");
    }

    try {
        const reviewsRef = ref(db, 'reviews');
        await push(reviewsRef, {
            // ✅ Optional Chaining (?) use karo taaki undefined hone par crash na ho
            username: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
            photo: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}`,
            text: reviewText,
            timestamp: serverTimestamp(),
        });
        setReviewText('');
        toast.success("Review posted! Thanks bhai.");
    } catch (err) {
        console.error(err);
        toast.error("Submit fail ho gaya!");
    }
};

    return (
  <div className="max-w-full py-20 overflow-hidden relative">
     <div className="relative flex overflow-hidden group">
      
      {/* 🌫️ Left & Right Blur Masks */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#020202] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#020202] to-transparent z-20 pointer-events-none" />

      {/* Marquee Wrapper */}
     <div className="overflow-hidden w-full py-10 marquee-container relative">
    {/* Sides mein fade effect (Optional) */}
    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>

    <motion.div 
        className="flex gap-6 w-max"
        animate={{
            x: [0, -1035], // Yahan tere adhe (original) array ki total width aayegi
        }}
        transition={{
            x: {
                repeat: Infinity,
                // repeatType: "loop",
                duration: 25, // Speed control yahan se karo
                ease: "linear",
            },
        }}
    >
        {/* Array ko double karna zaroori hai seamless effect ke liye */}
        {[...allReviews, ...allReviews,  ...allReviews, ...allReviews, ].map((rev, index) => (
            <div 
                key={index} 
                className="w-[350px] flex-shrink-0 bg-white/[0.03] p-8 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-500"
            >
                <p className="text-slate-300 text-md italic mb-8 whitespace-normal leading-relaxed min-h-[60px]">
                    "{rev.text}"
                </p>
                <div className="flex items-center gap-4">
                    <img 
                        src={rev.photo} 
                        className="w-14 h-14 rounded-full border-2 border-purple-500/20 object-cover" 
                        alt="user" 
                    />
                    <div className="overflow-hidden">
                        <h4 className="text-white text-sm font-bold truncate tracking-tight">{rev.username}</h4>
                        <p className="text-[10px] text-purple-400/60 tracking-[0.2em] uppercase font-black">Verified Dev</p>
                    </div>
                </div>
            </div>
        ))}
    </motion.div>
</div>
    </div>
    <h2 className="text-5xl font-bold text-white mb-16 italic text-center mt-9">
      User <span className="text-purple-500 text-5xl">Feedback</span>
    </h2>

    {/* ✅ 1. Input Section: Ye hamesha static rahega */}
    <div className="max-w-4xl mx-auto px-6 mb-20 relative z-30">
      {user ? (
        <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
          <textarea 
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:ring-1 ring-purple-500/50 transition-all resize-none placeholder:text-slate-600"
            placeholder="Your feedback fuels our innovation. Join the community of developers by sharing your thoughts on SyncCode."
            rows="3"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button 
              onClick={submitReview}
              className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-600/20"
            >
              Post Review
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-dashed border-white/10 text-center backdrop-blur-md">
          <p className="text-slate-400 mb-4 italic font-medium">"Unlock the ability to post reviews and contribute to the developer community by signing in."</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-2 mx-auto"
          >
            Login to share your feedback ➜
          </button>
        </div>
      )}
    </div>

    {/* ✅ 2. Infinite Scroll Section: Ye cards niche move karenge */}
    
  </div>
);
};

export default Review;