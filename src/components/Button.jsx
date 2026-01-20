import React from 'react'

const Button = () => {
  return (
    <div className='w-full'>
      <button className="w-full  bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white px-10 py-3 rounded-2xl text-[16px] font-black uppercase tracking-[2px] shadow-[0_10px_20px_rgba(168,85,247,0.3)] transition-all duration-300 hover:shadow-[0_15px_30px_rgba(168,85,247,0.4)] active:scale-95 border border-white/10" type='submit'>
          Join Space
      </button>
    </div>
  )
}

export default Button