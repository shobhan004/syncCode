import React , {useState} from 'react';
import Button from './Button';
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function HomeCard() {
  const navigate = useNavigate();
  const [roomId , setroomId] = useState('');
  const [username , setusername] = useState('');
  
  const handleJoin = () => {
    if(!roomId || !username){
      toast.error('Room Id and username required');
      return;
    }
    toast.success('Successfully joined');
    navigate(`/editor/${roomId}` , {
       state : {username}
    });
  };

  const NewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setroomId(id);
    toast.success('Generated New Room ID');
  }

  return (
    /* Yahan humne card ko semi-transparent (white/5) aur blur kiya hai */
    <div className='w-full max-w-[450px] bg-white/[0.03] backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 z-20 relative overflow-hidden'>
      
      {/* Subtle Inner Glow - Purple Touch */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 blur-3xl rounded-full" />
      
      <div className='flex flex-col gap-8 w-full relative z-10'>
        
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-white text-5xl font-bold tracking-tighter mb-2">
            Welcome <span className="text-purple-500 italic">Back</span>
          </h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[2px]">
            Join the workspace
          </p>
        </div>

        {/* Input Fields */}
        <form onSubmit={(e) =>{ e.preventDefault(); handleJoin()}}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="room" className="text-purple-400/80 text-[10px] uppercase tracking-[3px] ml-1 font-semibold">
              Invitation Room ID
            </label>
            <input 
              type='text' 
              autoFocus
              id='room' 
              placeholder='Ex: XYZ123' 
              onChange={(e) => setroomId(e.target.value)}
              value={roomId}
              /* Darker transparent inputs with purple focus */
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-purple-400/80 text-[10px] uppercase tracking-[3px] ml-1 font-semibold">
              Username
            </label>
            <input 
              type='text' 
              placeholder='Enter Username' 
              value={username}
              onChange={(e) => setusername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-2 relative z-10 flex justify-center hover:scale-[1.02] active:scale-98 transition-transform" >
           <Button />
        </div>
        </form>
        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">
          New here? <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors" onClick={NewRoom}>Create Space</span>
        </p>

      </div>
    </div>
  )
}

export default HomeCard;


 