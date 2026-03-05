import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaPaperPlane, FaPaperclip, FaCode, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './TeamChat.css';

// Initialize socket exactly once
const SOCKET_SERVER_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
let socket;

const TeamChat = forwardRef(({ team }, ref) => {
    const { user: currentUser, authFetch } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial message fetch
    useEffect(() => {
        if (!team) return;
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await authFetch(`http://localhost:3000/api/teams/${team.id}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();

        // Socket Setup
        if (!socket) {
            socket = io(SOCKET_SERVER_URL);
        }

        socket.emit('join_team', team.id);

        socket.on('receive_message', (data) => {
            setMessages(prev => {
                // Prevent duplicates if optimistic update already ran
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
            setTypingUser(null); // Clear typing if message arrives
        });

        socket.on('user_typing', (data) => {
            if (data.userId !== currentUser._id) {
                setTypingUser(data.username);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUser(null);
                }, 3000);
            }
        });

        // Cleanup
        return () => {
            if (socket) {
                socket.off('receive_message');
                socket.off('user_typing');
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [team, authFetch, currentUser?._id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const messageData = {
            id: Date.now().toString(), // temporary client ID
            teamId: team.id,
            userId: currentUser._id || currentUser.id,
            text: newMessage.trim(),
            type: isCodeMode ? 'code' : 'text',
            createdAt: new Date().toISOString()
        };

        // Optimistic UI Update
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
        if (isCodeMode) setIsCodeMode(false);

        // Persist to database
        try {
            const res = await authFetch(`http://localhost:3000/api/teams/${team.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    text: messageData.text,
                    type: messageData.type
                })
            });
            const persistedMsg = await res.json();

            if (res.ok) {
                // Update specific optimistic message with real ID from DB if necessary
                // Or let the optimistic one stand since we gave it a timestamp ID

                // Emit socket event for real-time broadcast USING THE REAL DB ID
                if (socket) {
                    socket.emit('send_message', persistedMsg);
                }
            } else {
                console.error("Failed to save message:", persistedMsg.message);
                // Optionally remove optimistic message from UI here on failure
            }

        } catch (e) {
            console.error("Persistence failed", e);
        }
    };

    useImperativeHandle(ref, () => ({
        sendMeetingLink: async (url) => {
            if (!currentUser || !team) return;

            const messageData = {
                id: Date.now().toString(),
                teamId: team.id,
                userId: currentUser._id || currentUser.id,
                text: `Started a video meeting: ${url}`,
                type: 'text',
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, messageData]);

            try {
                const res = await authFetch(`http://localhost:3000/api/teams/${team.id}/messages`, {
                    method: 'POST',
                    body: JSON.stringify({
                        text: messageData.text,
                        type: messageData.type
                    })
                });
                const persistedMsg = await res.json();
                if (res.ok && socket) {
                    socket.emit('send_message', persistedMsg);
                }
            } catch (e) {
                console.error("Persistence failed", e);
            }
        }
    }));

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload the file
            const token = localStorage.getItem('token');
            const uploadRes = await fetch(`http://localhost:3000/api/teams/${team.id}/messages/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (uploadRes.ok) {
                const { url, mimetype } = await uploadRes.json();

                // 2. Send the message with the attachment
                const fullUrl = `http://localhost:3000${url}`;
                const msgRes = await authFetch(`http://localhost:3000/api/teams/${team.id}/messages`, {
                    method: 'POST',
                    body: JSON.stringify({
                        text: `Sent a file: ${file.name}`,
                        type: 'file',
                        attachments: [fullUrl]
                    })
                });

                const persistedMsg = await msgRes.json();
                if (msgRes.ok) {
                    setMessages(prev => [...prev, persistedMsg]);
                    if (socket) socket.emit('send_message', persistedMsg);
                }
            }
        } catch (err) {
            console.error("File upload failed", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && e.target.value.trim().length > 0) {
            socket.emit('typing', { teamId: team.id, userId: currentUser._id, username: currentUser.username });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    if (!team || !currentUser) return null;

    return (
        <div className="team-chat-container">
            <div className="chat-header">
                <h3>#{team.name.toLowerCase().replace(/\s+/g, '-')}</h3>
                <div className="chat-header-status">
                    <span className="dot"></span> Online
                </div>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#5E6C84', marginTop: '20px' }}>Loading chat history...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#5E6C84', marginTop: '40px' }}>
                        No messages yet. Say hello to your team!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.userId === currentUser._id;
                        return (
                            <div key={msg.id} className={`message-item ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && <span className="message-sender">User {msg.userId.substring(0, 4)}</span>}
                                <div className="message-bubble">
                                    {msg.type === 'file' && msg.attachments && msg.attachments.length > 0 ? (
                                        <div className="message-attachment">
                                            {msg.attachments[0].match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                <img src={msg.attachments[0]} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px', marginBottom: '8px' }} />
                                            ) : (
                                                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '8px' }}>
                                                    <a href={msg.attachments[0]} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                                        Download Attachment
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    {msg.type === 'code' ? (
                                        <div style={{ borderRadius: '6px', overflow: 'hidden', fontSize: '0.85rem' }}>
                                            <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '12px' }}>
                                                {msg.text}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}

                                    <div className="message-meta">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {typingUser && (
                    <div className="typing-indicator">
                        {typingUser} is typing...
                    </div>
                )}
                {uploading && (
                    <div className="typing-indicator">Uploading file...</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="chat-actions">
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button className="chat-action-btn" title="Attach file" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <FaPaperclip />
                    </button>
                    <button
                        className="chat-action-btn"
                        title={isCodeMode ? "Cancel Code Snippet" : "Share code snippet"}
                        onClick={() => setIsCodeMode(!isCodeMode)}
                        style={{ color: isCodeMode ? '#0052CC' : '#6B778C' }}
                    >
                        {isCodeMode ? <FaTimes /> : <FaCode />}
                    </button>
                </div>
                <textarea
                    className="chat-textarea"
                    placeholder={isCodeMode ? "Paste your code snippet here..." : "Type a message... (Shift+Enter for newline)"}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    rows={isCodeMode ? "4" : "1"}
                    style={isCodeMode ? { fontFamily: 'monospace', backgroundColor: '#e3e4e6' } : {}}
                />
                <button
                    className="btn-send"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
});

export default TeamChat;
