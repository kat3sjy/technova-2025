import { useUserStore } from '../store/userStore';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const user = useUserStore(s => s.user);
  return (
    <div className="grid" style={{gap:'2rem'}}>
      <section className="card">
        <h1>Welcome {user?.firstName ? user.firstName : '👋'} </h1>
        <p>Connect with others through mentorship, events, and group chats.</p>
        {!user && <Link to="/onboarding"><button>Get Started</button></Link>}
        {user && <Link to={`/profile/${user.username}`}><button>Your Profile</button></Link>}
        <span style={{ marginLeft: 8 }} />
        <Link to="/chat"><button>Messages</button></Link>
        <Link to="/chat">
          <button style={{ marginTop: 16 }}>
            Explore Chat
          </button>
        </Link>
      </section>
      <section className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
        <div className="card">
          <h3>Micro-Mentorship</h3>
          <p>Short, focused mentor sessions tailored to skill goals.</p>
        </div>
        <div className="card">
          <h3>Event Match</h3>
          <p>Find people going to the same conference or tournament.</p>
        </div>
        <div className="card">
          <h3>Confidence Builder</h3>
          <p>Track weekly wins & reflections.</p>
        </div>
        <div className="card">
          <h3>Messages</h3>
          <p>DM friends or chat with your groups.</p>
          <Link to="/chat"><button>Open</button></Link>
        </div>
      </section>
    </div>
  );
}
