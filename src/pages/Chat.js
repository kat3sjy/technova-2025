import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../store/chat';
export default function ChatPage() {
    const { userId, ensureSocket, joinSharedRoom, startDemoDM, sendMessage, conversations, activeConversationId, setActiveConversation, connecting, error } = useChatStore();
    const convo = useMemo(() => (activeConversationId ? conversations[activeConversationId] : undefined), [conversations, activeConversationId]);
    const [text, setText] = useState('');
    const listRef = useRef(null);
    useEffect(() => {
        ensureSocket();
    }, [ensureSocket]);
    useEffect(() => {
        if (!listRef.current)
            return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [convo?.messages?.length]);
    return (_jsxs("div", { style: { maxWidth: 900, margin: '0 auto', padding: 16 }, children: [_jsx("h1", { children: "Chat" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }, children: [_jsx("button", { onClick: () => joinSharedRoom(), disabled: connecting, children: "Join Shared Demo Room" }), _jsx("button", { onClick: () => startDemoDM(), disabled: connecting, children: "Start Demo DM" })] }), error && _jsx("div", { style: { color: 'tomato' }, children: error }), _jsxs("div", { style: { display: 'flex', gap: 16 }, children: [_jsxs("aside", { style: { width: 240 }, children: [_jsx("h3", { children: "Conversations" }), _jsx("ul", { style: { listStyle: 'none', padding: 0 }, children: Object.values(conversations).map(c => (_jsx("li", { children: _jsx("button", { onClick: () => setActiveConversation(c.id), style: {
                                            width: '100%',
                                            textAlign: 'left',
                                            background: c.id === activeConversationId ? '#222' : '#111',
                                            color: 'white',
                                            padding: 8,
                                            border: '1px solid #333',
                                            borderRadius: 6,
                                            marginBottom: 6
                                        }, children: c.name || c.id }) }, c.id))) })] }), _jsx("main", { style: { flex: 1 }, children: !convo ? (_jsx("div", { children: "Select or create a conversation." })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { border: '1px solid #333', borderRadius: 6, padding: 8, height: 360, overflowY: 'auto' }, ref: listRef, children: (convo.messages || []).map(m => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("strong", { style: { color: m.userId === userId ? '#8ef' : '#fea' }, children: m.userId }), ": ", m.text] }, m.id))) }), _jsxs("form", { onSubmit: async (e) => {
                                        e.preventDefault();
                                        const t = text.trim();
                                        if (!t)
                                            return;
                                        await sendMessage(t);
                                        setText('');
                                    }, style: { display: 'flex', gap: 8, marginTop: 8 }, children: [_jsx("input", { value: text, onChange: e => setText(e.target.value), placeholder: "Type a message", style: { flex: 1, padding: 8 } }), _jsx("button", { type: "submit", children: "Send" })] })] })) })] })] }));
}
