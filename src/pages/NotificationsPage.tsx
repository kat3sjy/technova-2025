import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './messages-style.css';

type Notification =
  | { id: string; type: 'message'; from: string; text: string; at: number }
  | { id: string; type: 'friend_request'; from: string; at: number };

const seedNotifications: Notification[] = [
  { id: 'n1', type: 'message', from: 'Alex', text: 'Hey! Want to squad up tonight?', at: Date.now() - 1000 * 60 * 5 },
  { id: 'n2', type: 'friend_request', from: 'Sam', at: Date.now() - 1000 * 60 * 60 },
  { id: 'n3', type: 'message', from: 'Maya', text: 'GGs earlier! That clutch was insane 🔥', at: Date.now() - 1000 * 60 * 90 },
];

function timeAgo(ms: number) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const user = useUserStore(s => s.user);

  return (
    <div className="container">
      <h1 className="jua-title" style={{ marginBottom: 12 }}>Notifications</h1>

      <section className="panel-purple" style={{ padding: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>What’s new</div>
          <span className="tag">For @{user?.username || 'you'}</span>
          <span style={{ flex: 1 }} />
          <Link to="/messages"><button className="btn-white">Open Messages</button></Link>
        </header>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {seedNotifications.map(n => (
            <li key={n.id} style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {n.type === 'message' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="convo-chip">{n.from.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      New message from {n.from}
                      <span style={{ opacity: 0.8, fontWeight: 500 }}> • {timeAgo(n.at)}</span>
                    </div>
                    <div style={{ opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.text}</div>
                  </div>
                  <Link to="/messages"><button className="btn-purple">View</button></Link>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="convo-chip">{n.from.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      {n.from} sent you a friend request
                      <span style={{ opacity: 0.8, fontWeight: 500 }}> • {timeAgo(n.at)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/connections"><button className="btn-white">Review</button></Link>
                    <Link to="/friends"><button className="btn-purple">Friends</button></Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
