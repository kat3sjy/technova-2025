import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={() => navigate('/chat')} style={{ marginTop: 16 }}>
        Explore Chat
      </button>
    </div>
  );
}
