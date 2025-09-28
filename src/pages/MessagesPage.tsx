import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../store/chat';
import './messages-style.css';

// Messages page with left-side contact list and right-side conversation view
export default function MessagesPage() {
  const {
    userId,
    ensureSocket,
    joinSharedRoom,
    startDemoDM,
    sendMessage,
    conversations,
    activeConversationId,
    setActiveConversation,
    connecting,
    error
  } = useChatStore();

  const convo = useMemo(() => (activeConversationId ? conversations[activeConversationId] : undefined), [conversations, activeConversationId]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureSocket(); }, [ensureSocket]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [convo?.messages?.length]);

  const items = Object.values(conversations)
    .map(c => ({
      ...c,
      last: c.messages?.[c.messages.length - 1]
    }))
    .filter(c => !filter.trim() || (c.name || c.id).toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="container">
      <h1 style={{ marginBottom: 12 }}>Messages</h1>
      {error && <div style={{ color: 'tomato', marginBottom: 8 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* Sidebar: conversations */}
        <aside className="panel-purple" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 480 }}>
          <div style={{ padding: '12px 12px 0 12px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => joinSharedRoom()} disabled={connecting} className="btn-white" style={{ flex: 1 }}>Open Chat</button>
              <button onClick={() => startDemoDM()} disabled={connecting} className="btn-purple" title="Uses the shared room under the hood">New DM</button>
            </div>
            <div style={{ marginTop: 10 }}>
              <input placeholder="Search" value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 12 }} />
          <div style={{ overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.length === 0 && (
                <li style={{ padding: 12, color: '#93a3b8' }}>No conversations yet.</li>
              )}
              {items.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveConversation(c.id)}
                    className={`convo-item ${c.id === activeConversationId ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="convo-chip">
                        {(c.name || c.id).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{c.name || c.id}</div>
                        {c.last && (
                          <div style={{ opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '.85rem' }}>
                            <span style={{ color: c.last.userId === userId ? '#8ef' : '#fea', fontWeight: 600 }}>{c.last.userId === userId ? 'You' : c.last.userId}:</span>{' '}
                            {c.last.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main panel: active conversation */}
        <main className="panel-purple" style={{ display: 'flex', flexDirection: 'column', minHeight: 480, padding: 16 }}>
          {!convo ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#93a3b8' }}>
              Select a conversation or start one.
            </div>
          ) : (
            <>
              <header style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 10 }}>
                <div className="convo-header-chip">
                  {(convo.name || convo.id).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{convo.name || convo.id}</div>
                  <div className="tag" style={{ marginTop: 4 }}>Active</div>
                </div>
                <span style={{ flex: 1 }} />
              </header>

              <div ref={listRef} className="messages-body" style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                {(convo.messages || []).map(m => (
                  <div key={m.id} style={{ marginBottom: 10, display: 'flex', justifyContent: m.userId === userId ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '70%',
                        background: m.userId === userId ? 'linear-gradient(135deg,#1f6feb,#8ecbff)' : '#14171d',
                        color: m.userId === userId ? '#0a0c10' : '#f5f7fa',
                        padding: '8px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}
                    >
                      <div style={{ fontSize: '.85rem', opacity: 0.85, marginBottom: 4 }}>
                        {m.userId === userId ? 'You' : m.userId}
                      </div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const t = text.trim();
                  if (!t) return;
                  await sendMessage(t);
                  setText('');
                }}
                style={{ display: 'flex', gap: 8, marginTop: 10 }}
              >
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" style={{ fontSize: '1rem' }} />
                <button type="submit" className="btn-white">Send</button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
