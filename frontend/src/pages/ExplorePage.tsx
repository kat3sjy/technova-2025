
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';

export default function ExplorePage() {
  const [members, setMembers] = useState([]);
  const user = useUserStore(s => s.user);

  useEffect(() => {
    fetch('/api/profile') // or your users endpoint
      .then(res => res.json())
      .then(data => setMembers(data));
  }, []);

  const handleConnect = async (targetId: string) => {
    if (!user) return alert('Sign in first!');
    await fetch('/api/match-actions/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: user.id, toId: targetId })
    });
    alert('Match request sent!');
  };

  return (
    <div className="grid" style={{gap:'1rem'}}>
      <h2>Explore Members & Events</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
        {members.map(m => (
          <div key={m._id} className="card">
            <h3>{m.username}</h3>
            <div className="tag">{m.bio}</div>
            <p style={{opacity:.7, fontSize:'.8rem', marginTop:'.5rem'}}>{m.location}</p>
            <button style={{marginTop:'.75rem', width:'100%'}} onClick={() => handleConnect(m._id)}>Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}
