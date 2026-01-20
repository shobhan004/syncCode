import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const linkedin = "https://www.linkedin.com/in/shobhan-bhagwati-750586399?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app";
    return (
        <footer className="w-full bg-white/[0.02] backdrop-blur-xl border-t border-white/5 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='bg-gradient-to-tr from-blue-600 to-purple-500 p-1.5 rounded-lg'>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">Sync<span className="bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 bg-clip-text text-transparent">Code</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Real-time collaborative code editor with AI integration. Built for developers, by developers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">Editor</li>
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">AI Assistant</li>
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">Compiler</li>
                        </ul>
                    </div>

                    {/* Social/Community */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Community</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">
                            <a
                            href="https://github.com/shobhan004"
                            target='_blank'
                            rel="noopener noreferrer"
                            >
                             GitHub
                            </a>
                            </li>
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">Discord</li>
                            <li className="hover:text-purple-400 cursor-pointer transition-colors">
                                <a 
                                href={linkedin} // 👈 Yahan apna link daal
                                 target="_blank"  // 👈 Naye tab mein kholne ke liye
                                 rel="noopener noreferrer" // 👈 Security ke liye (Best practice)
                                >
                                  LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Credits */}
                    {/* Legal/Support Section */}
<div>
    <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
    <ul className="space-y-2 text-slate-500 text-sm">
        <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
        <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</li>
        <li className="hover:text-purple-400 cursor-pointer transition-colors">Cookie Policy</li>
    </ul>
</div>

                </div>

                <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-xs">
                        © 2026 SyncCode. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-600">
                        <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;