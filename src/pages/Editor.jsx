import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import React, { useEffect, useRef, useState } from 'react';
import '../App';
import Editing from '../components/Editing';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { initSocket } from '../socket';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ACTIONS } from '../action';
import Avatar from 'react-avatar';
import axios from 'axios';
import { ref, set, onValue, off, push } from "firebase/database";
import { db } from "../firebase";

function Editor() {
    const [clients, setClients] = useState([]);
    const stdinRef = useRef('');
    const inputEditorRef = useRef(null);
    const [typingUser, setTypingUser] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isCompiling, setIsCompiling] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef(null);

    const location = useLocation();
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const navigate = useNavigate();
    const { roomId } = useParams();
    const timerRef = useRef(null);

    // ✅ 1. Firebase & Socket Logic
    useEffect(() => {
        if (!location.state?.username) {
            toast.error('Username is required');
            navigate('/');
            return;
        }

        const codeDbRef = ref(db, `rooms/${roomId}/code`);
        const inputDbRef = ref(db, `rooms/${roomId}/stdin`);
        const outputDbRef = ref(db, `rooms/${roomId}/output`);
        const typingDbRef = ref(db, `rooms/${roomId}/typing`);

        // Firebase Listeners
        onValue(typingDbRef, (snapshot) => {
            const typingName = snapshot.val();
            if (typingName && typingName !== location.state?.username) {
                setTypingUser(typingName);
                if (window.typingTimer) clearTimeout(window.typingTimer);
                window.typingTimer = setTimeout(() => {
                    setTypingUser('');
                    set(ref(db, `rooms/${roomId}/typing`), "");
                }, 2500);
            }
        });

        onValue(codeDbRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && val !== codeRef.current) {
                codeRef.current = val;
            }
        });

        onValue(inputDbRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && val !== stdinRef.current) {
                stdinRef.current = val;
                if (inputEditorRef.current) {
                    inputEditorRef.current.setValue(val);
                }
            }
        });

        onValue(outputDbRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setOutput(val);
        });

        // ✅ FIXED: Async Socket Initialization
        const initOldSocket = async () => {
            if (!socketRef.current) {
                const socket = await initSocket();
                socketRef.current = socket;

                socket.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state.username
                });

                socket.on(ACTIONS.JOINED, ({ clients, username }) => {
                    setClients(clients);
                    // if (username !== location.state.username) {
                    //     toast.success(`${username} joined`);
                    // }
                });

                // ✅ Sidebar Tracking (No flicker)
                socket.on(ACTIONS.CURSOR_CHANGE, ({ socketId, lineNumber }) => {
                    setClients((prev) =>
                        prev.map((client) =>
                            client.socketId === socketId ? { ...client, currentLine: lineNumber + 1 } : client
                        )
                    );
                });

                socket.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                    // if (username) toast.error(`${username} left`);
                    setClients((prev) => prev.filter(c => c.socketId !== socketId));
                });
            }
        };
        initOldSocket();

        return () => {
            off(codeDbRef);
            off(inputDbRef);
            off(outputDbRef);
            off(typingDbRef);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId]);

    // ✅ 2. Input Editor Setup
    useEffect(() => {
        if (!inputEditorRef.current && document.getElementById('stdin-box')) {
            inputEditorRef.current = CodeMirror.fromTextArea(document.getElementById('stdin-box'), {
                mode: 'text/plain',
                theme: 'dracula',
                lineNumbers: false,
                lineWrapping: true,
            });

            inputEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const val = instance.getValue();
                stdinRef.current = val;
                if (origin !== 'setValue') {
                    set(ref(db, `rooms/${roomId}/stdin`), val);
                }
            });
        }
    }, [roomId]);

    // ✅ 3. Chat Logic
    useEffect(() => {
        const chatDbRef = ref(db, `rooms/${roomId}/messages`);
        const unsubscribe = onValue(chatDbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setMessages(Object.values(data));
        });
        return () => off(chatDbRef);
    }, [roomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = newMessage;
        setNewMessage("");
        const chatDbRef = ref(db, `rooms/${roomId}/messages`);

        await push(chatDbRef, {
            text: userMsg,
            username: location.state?.username || "Guest",
            timestamp: Date.now(),
            isAi: false,
        });

        if (userMsg.toLowerCase().startsWith("/ai")) {
            try {
                const prompt = userMsg.replace("/ai", "").trim();
                const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
               // ✅ Gemini 2.5 Flash ka updated URL
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

                setIsAiLoading(true);
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
    contents: [{ 
        parts: [{ 
            text: `Instruction: You are a coding assistant. Analyze and explain the following code or answer the question. 
            
            User Input: ${prompt}` 
        }] 
    }],
    // ✅ Safety settings ko relax karne ke liye ye add kar sakte ho (Optional)
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
    ]
}),
                });

                const data = await response.json();
                const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

                await push(chatDbRef, {
                    text: aiText,
                    username: "SyncCode AI",
                    timestamp: Date.now(),
                    isAi: true,
                });
            } catch (err) {
                toast.error("AI Error");
            } finally {
                setIsAiLoading(false);
            }
        }
    };

    const runCode = async () => {
        if (!codeRef.current?.trim()) return toast.error("Write code first!");
        setIsCompiling(true);
        setOutput("Compiling...");
        try {
            const languageMap = {
                javascript: { lang: 'javascript', version: '18.15.0' },
                python: { lang: 'python', version: '3.10.0' },
                cpp: { lang: 'c++', version: '10.2.0' },
                java: { lang: 'java', version: '15.0.2' },
            };
            const config = languageMap[language];
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: config.lang,
                version: config.version,
                files: [{ content: codeRef.current }],
                stdin: stdinRef.current,
            });
            const out = response.data.run.stderr || response.data.run.stdout || response.data.run.output;
            setOutput(out);
            set(ref(db, `rooms/${roomId}/output`), out);
        } catch (err) {
            setOutput("Execution failed");
        } finally {
            setIsCompiling(false);
        }
    };

    const handleCodeChange = (newCode) => {
        codeRef.current = newCode;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            set(ref(db, `rooms/${roomId}/code`), newCode);
        }, 300);
    };

    const copyRoomId = async () => {
        await navigator.clipboard.writeText(roomId);
        toast.success('Room ID copied!');
    };

    const downloadCode = () => {
        const blob = new Blob([codeRef.current], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `code_${roomId}.txt`;
        link.click();
    };

    const leaveRoom = () => {
        navigate('/');
    };

   return (
    <div className='h-screen w-full bg-[#050505] text-slate-300 flex flex-col overflow-hidden relative font-sans'>
        <header className='h-16 w-full bg-white/[0.02] backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-20'>
            <div className='flex items-center gap-3'>
                <div className='bg-gradient-to-tr from-blue-600 to-purple-500 p-2 rounded-xl'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                    Sync<span className=" bg-gradient-to-r  from-purple-400 via-purple-600 to-indigo-500 bg-clip-text text-transparent">Code</span>
                </span>
            </div>
            <div className='flex items-center gap-4'>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#1e1e2e] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                </select>
                <button onClick={runCode} disabled={isCompiling} className="flex items-center gap-2 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50">
                    {isCompiling ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Run"}
                </button>
                <button onClick={leaveRoom} className='bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-lg text-sm font-bold border border-red-500/20'>Leave</button>
            </div>
        </header>

        <main className='flex-1 w-full overflow-hidden p-2'>
            <PanelGroup direction="horizontal">
                <Panel defaultSize={20} minSize={20} maxSize={34} className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl mr-2">
                    <div className='flex flex-col h-full p-5'>
                        <h2 className='text-[13px] uppercase tracking-[2px] font-bold text-purple-400/70 mb-5'>Users</h2>
                        <div className='flex-1 overflow-y-auto space-y-4 custom-scrollbar'>
                            {clients.map((u, index) => (
                                <div key={u.socketId} className='flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 group border border-transparent hover:border-white/5'>
                                    <div className="relative">
                                        <div className={`p-[1.5px] rounded-[11px] ${index === 0 ? 'bg-gradient-to-tr from-yellow-500 to-amber-200' : 'bg-white/10'}`}>
                                            <Avatar name={u.username} size="38" round="10px" />
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute -top-2 -right-2 bg-[#050505] p-1 rounded-full border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 21H19V19H5V21ZM19 8L15 10L12 3L9 10L5 8L7 17H17L19 8Z" fill="#EAB308" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-bold tracking-tight ${index === 0 ? 'text-yellow-200/90' : 'text-slate-200'}`}>
                                                {u.username}
                                                {u.username === location.state?.username && <span className="ml-2 text-[8px] text-slate-500 opacity-60">(You)</span>}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${u.currentLine ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                            <span className="text-[10px] text-emerald-400 font-mono italic">
                                                {u.currentLine ? `Line: ${u.currentLine}` : 'Viewing...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Remaining footer buttons inside sidebar */}
                        <div className="mt-4 h-5">
                            {typingUser && <p className="text-[11px] text-emerald-400 font-bold animate-pulse tracking-widest">{typingUser} is typing...</p>}
                        </div>
                        <button onClick={copyRoomId} className='mt-4 w-full py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/20 text-[12px] font-bold'>COPY ID</button>
                        <button onClick={downloadCode} className='mt-3 w-full py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/20 text-[12px] font-bold uppercase'>Download</button>
                    </div>
                </Panel>
                {/* Rest of the Panels (Editor, Terminal, Input) remains same */}
                <PanelResizeHandle className="w-1 cursor-col-resize" />
                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={70} minSize={70} className="relative bg-[#1e1e1e] border border-white/5 rounded-3xl mb-2 overflow-hidden shadow-2xl">
                            <Editing socketRef={socketRef} roomId={roomId} onCodeChange={handleCodeChange} username={location.state?.username} />
                        </Panel>
                        <PanelResizeHandle className="h-1 cursor-row-resize" />
                        <Panel defaultSize={30} minSize={10} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <PanelGroup direction="horizontal">
                                <Panel className="border-r border-white/5 h-full flex flex-col">
                                    <div className="px-5 py-2.5 bg-white/5 border-b border-white/5 flex justify-between">
                                        <span className="text-[14px] font-bold text-purple-400/70">Terminal</span>
                                        <button onClick={() => setOutput('')} className="text-[11px] text-slate-500 hover:text-white font-bold">Clear</button>
                                    </div>
                                    <div className="flex-1 p-5 font-mono text-sm overflow-y-auto custom-scrollbar">
                                        <pre className="whitespace-pre-wrap">{output || "Run code to see output"}</pre>
                                    </div>
                                </Panel>
                                <PanelResizeHandle className="w-1 cursor-col-resize" />
                                <Panel defaultSize={50} maxSize={70} minSize={30} className="h-full flex flex-col">
                                    <div className="px-5 py-2.5 bg-white/5 border-b border-white/5">
                                        <span className="text-[14px] font-bold text-purple-400/70 uppercase tracking-widest">Input</span>
                                    </div>
                                    <div className="flex-1 bg-black/10 overflow-hidden">
                                        <textarea id="stdin-box"></textarea>
                                    </div>
                                </Panel>
                            </PanelGroup>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </main>
        {/* Chat logic remains below... */}
         {/* ✅ Modern Floating Chat Button */}
<button 
    onClick={() => setIsChatOpen(!isChatOpen)} 
    className={`fixed right-8 z-50 p-4 rounded-full transition-all duration-500 shadow-2xl flex items-center justify-center ${
        isChatOpen 
        ? 'top-6 bg-red-500/10 text-red-500 border border-red-500/20 rotate-90' 
        : 'bottom-8 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white hover:scale-110 active:scale-90 shadow-purple-500/40'
    }`}
>
    {isChatOpen ? (
        // Cross (X) Icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ) : (
        // Chat Bubble Icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    )}
</button>

            <div className={`fixed top-0 right-0 h-full w-[400px] bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 z-40 transition-transform duration-500 shadow-2xl ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full pt-16 p-6">
                    <h3 className="text-white font-bold text-lg italic border-b border-white/10 pb-2 mb-4">Discussion</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.isAi ? 'items-center' : msg.username === location.state?.username ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] font-bold text-slate-500 uppercase mb-1">{msg.isAi ? "✨ SyncCode AI" : msg.username}</span>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] ${msg.isAi ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : msg.username === location.state?.username ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-200'}`}>{msg.text}</div>
                            </div>
                        ))}
                        {isAiLoading && <p className="text-blue-400 text-xs animate-pulse">AI is thinking...</p>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type /ai for help..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 ring-purple-500/50" />
                        <button type="submit" className="p-2 bg-purple-600 rounded-xl text-white">➤</button>
                    </form>
                </div>

            </div>
    </div>
);
}

export default Editor;