import React from 'react'

function Feature() {
  return (
    <div>
      {/* Introduction Section */}
<div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
    <div className="text-center mb-16">
        <h2 className="text-4xl md:text-4xl font-bold text-white mb-4">
            Powerful features for <span className="bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient">Modern Developers</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
            SyncCode is more than just an editor. It's a collaborative ecosystem designed to make pair programming seamless and intelligent.
        </p>
    </div>

    {/* Feature Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: AI Gemini */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 italic">AI Gemini Integration</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                Powered by Gemini 1.5 Flash. Type <span className="text-purple-400 font-mono">/ai</span> in chat to debug, explain logic, or generate code snippets instantly.
            </p>
        </div>

        {/* Card 2: Real-time Sync */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 italic">Real-time Collaboration</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                Seamless code synchronization powered by Socket.io. Track teammates with sidebar presence and line indicators.
            </p>
        </div>

        {/* Card 3: Cloud Persistence */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 italic">Cloud Persistence</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                Never lose your progress. Firebase Real-time Database ensures your code stays safe even if you refresh the page.
            </p>
        </div>

    </div>
</div>
    </div>
  )
}

export default Feature
