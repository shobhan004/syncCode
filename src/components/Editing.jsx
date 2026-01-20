import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/theme/dracula.css';
import '../App.css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import { ACTIONS } from '../action';
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";

function Editing({ socketRef, roomId, onCodeChange, username }) {
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current) {
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
                mode: { name: 'javascript', json: true },
                theme: 'dracula',
                lineNumbers: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
            });
        }

        const codeRefDb = ref(db, `rooms/${roomId}/code`);

        const unsubscribe = onValue(codeRefDb, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && editorRef.current) {
                const editor = editorRef.current;
                if (editor.getValue() !== val) {
                    const cursor = editor.getCursor();
                    editor.setValue(val);
                    editor.setCursor(cursor);
                    // ✅ Highlighting re-apply wala jhanjhat khatam!
                }
            }
        });

        editorRef.current.on('change', (instance, changes) => {
            const { origin } = changes;
            const code = instance.getValue();
            if (origin !== 'setValue') {
                onCodeChange(code); 
                set(ref(db, `rooms/${roomId}/code`), code);
            }
        });

        // ✅ Sirf info bhej rahe hain, sidebar mein line number dikhane ke liye
        editorRef.current.on('cursorActivity', (instance) => {
            if (!instance.hasFocus()) return;
            const { line } = instance.getCursor();
            if (socketRef.current) {
                socketRef.current.emit(ACTIONS.CURSOR_CHANGE, {
                    roomId,
                    lineNumber: line,
                    username,
                });
            }
        });

        return () => {
            unsubscribe();
            if (editorRef.current) {
                editorRef.current.toTextArea();
                editorRef.current = null;
            }
        };
    }, [roomId]); 

    return (
        <div className='flex-1 h-full overflow-hidden'>
            <textarea id='realtimeEditor'></textarea>
        </div>
    );
}

export default Editing;