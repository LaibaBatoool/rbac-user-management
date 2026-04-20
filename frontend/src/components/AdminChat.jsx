import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Only show for admin and manager
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return null;
    }

    const isAdmin = user.role === 'admin';
    const botLabel = isAdmin ? '🤖 Admin AI' : '🤖 Manager AI';
    const botColor = isAdmin ? '#6366f1' : '#0ea5e9';
    const welcomeMessage = isAdmin
        ? "Hi Admin! I can help you with user stats, role recommendations, task overviews, and system insights. Ask me anything!"
        : "Hi! I'm your Manager AI. Ask me about your projects, team tasks, or workload status.";

    const suggestedQuestions = isAdmin
        ? [
            "How many users are there?",
            "Recommend role promotions",
            "Show task stats",
            "Give me a system overview",
        ]
        : [
            "Show my project stats",
            "How are my team tasks?",
            "Give me a team summary",
        ];

    // Scroll to bottom when messages update
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    // Add welcome message when chat opens for first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'bot', text: welcomeMessage }]);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        const token = localStorage.getItem('token');
        const userMsg = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post(
                '/ai/chat',
                { message: messageText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const botMsg = { role: 'bot', text: res.data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            const detail = err.response?.data?.message || err.message || 'Unknown error';
            const errMsg = { role: 'bot', text: `⚠️ Error: ${detail}`, isError: true };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating chat panel */}
            {isOpen && (
                <div style={styles.panel}>
                    {/* Header */}
                    <div style={{ ...styles.header, background: botColor }}>
                        <div style={styles.headerLeft}>
                            <div style={styles.avatar}>{isAdmin ? '👑' : '📊'}</div>
                            <div>
                                <div style={styles.headerTitle}>{botLabel}</div>
                                <div style={styles.headerSub}>
                                    {isAdmin ? 'Full System Access' : 'Scoped to Your Projects'}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={styles.messagesArea}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.messageBubble,
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.role === 'user'
                                        ? botColor
                                        : msg.isError ? '#fee2e2' : '#f1f5f9',
                                    color: msg.role === 'user' ? '#fff' : msg.isError ? '#dc2626' : '#1e293b',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                }}
                            >
                                {msg.text.split('\n').map((line, j) => (
                                    <span key={j}>{line}<br /></span>
                                ))}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div style={{ ...styles.messageBubble, alignSelf: 'flex-start', background: '#f1f5f9' }}>
                                <div style={styles.typingDots}>
                                    <span style={{ ...styles.dot, animationDelay: '0s' }} />
                                    <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                                    <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested questions */}
                    {messages.length <= 1 && (
                        <div style={styles.suggestionsArea}>
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    style={{ ...styles.suggestionBtn, borderColor: botColor, color: botColor }}
                                    onClick={() => sendMessage(q)}
                                    onMouseEnter={e => {
                                        e.target.style.background = botColor;
                                        e.target.style.color = '#fff';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = botColor;
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={styles.inputArea}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            style={styles.textarea}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                ...styles.sendBtn,
                                background: input.trim() && !isTyping ? botColor : '#cbd5e1',
                                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                style={{ ...styles.fab, background: botColor }}
                title={botLabel}
            >
                {isOpen ? '✕' : isAdmin ? '👑' : '📊'}
                {!isOpen && (
                    <span style={styles.fabLabel}>
                        {isAdmin ? 'Admin AI' : 'Manager AI'}
                    </span>
                )}
            </button>

            {/* Typing animation keyframes */}
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </>
    );
};

// ──────────────────────────────
//  Inline styles
// ──────────────────────────────
const styles = {
    panel: {
        position: 'fixed',
        bottom: '90px',
        right: '24px',
        width: '380px',
        maxHeight: '560px',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        zIndex: 9999,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        color: '#fff',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
    },
    headerTitle: {
        fontWeight: '700',
        fontSize: '15px',
    },
    headerSub: {
        fontSize: '11px',
        opacity: 0.85,
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '200px',
        maxHeight: '320px',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: '10px 14px',
        fontSize: '13.5px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
    },
    typingDots: {
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        padding: '4px 0',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#94a3b8',
        display: 'inline-block',
        animation: 'bounce 1.2s infinite',
    },
    suggestionsArea: {
        padding: '8px 12px 0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
    },
    suggestionBtn: {
        padding: '5px 10px',
        borderRadius: '20px',
        border: '1.5px solid',
        background: 'transparent',
        fontSize: '11.5px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontWeight: '500',
    },
    inputArea: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '12px 12px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    textarea: {
        flex: 1,
        resize: 'none',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        padding: '9px 12px',
        fontSize: '13.5px',
        fontFamily: 'inherit',
        outline: 'none',
        background: '#fff',
        lineHeight: '1.4',
        maxHeight: '100px',
        overflowY: 'auto',
    },
    sendBtn: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        border: 'none',
        color: '#fff',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s',
    },
    fab: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 18px',
        borderRadius: '30px',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '18px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        zIndex: 9999,
        transition: 'transform 0.2s, box-shadow 0.2s',
        fontWeight: '600',
    },
    fabLabel: {
        fontSize: '13px',
        fontWeight: '600',
        letterSpacing: '0.01em',
    },
};

export default AdminChat;