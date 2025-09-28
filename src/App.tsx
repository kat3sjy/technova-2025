import React from 'react';
import { NavLink, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import OnboardingPage from './pages/OnboardingPage';
import FocusAreasPage from './pages/FocusAreasPage';
import ExperienceGoalsPage from './pages/ExperienceGoalsPage';
import BioPicturePage from './pages/BioPicturePage';
import SettingsPage from './pages/SettingsPage';
// import ProfileSettingsPage from './pages/ProfileSettingsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConnectionsPage from './pages/ConnectionsPage';
import { UserStoreProvider } from './store/userStore';
import NotificationsPage from './pages/NotificationsPage';
import FriendsPage from './pages/FriendsPage';
import AIDemoPage from './pages/AIDemoPage';
import ChatPage from './pages/Chat';
import PersonalInfoPage from './pages/PersonalInfoPage';
// Notification icon asset
// Using an explicit import so Vite bundles the image even though it's outside public/
// (located at ../images/7838363.png relative to this file)
import notifIcon from '../images/7838363.png';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state = { error: undefined as Error | undefined };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('App error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <UserStoreProvider>
      <ErrorBoundary>
        <div>
          <NavBar />
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              {/* Onboarding flow routes */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/onboarding/focus-areas" element={<FocusAreasPage />} />
              <Route path="/onboarding/experience-goals" element={<ExperienceGoalsPage />} />
              <Route path="/onboarding/bio-picture" element={<BioPicturePage />} />
              <Route path="/personal-info" element={<PersonalInfoPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/ai-demo" element={<AIDemoPage />} />
              <Route path="/chat" element={<ChatPage />} />
              {/* Redirect legacy /messages -> /chat */}
              <Route path="/messages" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
          <footer>© {new Date().getFullYear()} Ctrl+Femme • Empowering connection across gaming, tech, and sports</footer>
        </div>
      </ErrorBoundary>
    </UserStoreProvider>
  );
}

function NavBar() {
  const { user, logout } = useUserStore((s: any) => ({ user: s.user, logout: s.logout }));
  const navigate = useNavigate();
  const incomingCount = user?.incomingRequests?.length || 0;
  const authedLinks = [
    { to: '/', label: 'HOME' },
    { to: '/connections', label: `CONNECTIONS${incomingCount ? ` (${incomingCount})` : ''}` },
    { to: '/friends', label: 'FRIENDS' },
    { to: '/personal-info', label: 'BASIC INFO' },
  { to: '/settings', label: 'SETTINGS' }
  ];
  const publicLinks = [
    { to: '/', label: 'HOME' },
    { to: '/personal-info', label: 'BASIC INFO' },
    { to: '/login', label: 'SIGN IN' },
    { to: '/signup', label: 'JOIN NOW' }
  ];
  const links = user ? authedLinks : publicLinks;
  return (
    <nav aria-label="Main navigation" style={{display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap'}}>
      <strong style={{marginRight:'2rem', fontSize:'1.2rem', fontWeight:'700', color:'#ffffff'}}>Ctrl+Femme</strong>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }: { isActive: boolean }) => isActive ? 'active' : ''}
          style={{ position:'relative' }}
        >
          {l.label}
        </NavLink>
      ))}
      <span style={{flex:1}} />
    </nav>
  );
}

function UserCorner() {
  const { user, logout } = useUserStore((s: any) => ({ user: s.user, logout: s.logout }));
  const navigate = useNavigate();
  if(!user) return null;
  return (
    <div style={{position:'fixed', top:8, right:12, display:'flex', alignItems:'center', gap:'0.75rem', zIndex:2000}}>
      <NavLink
        to="/notifications"
        className={({isActive}:{isActive:boolean})=> isActive? 'active' : ''}
        title="Notifications"
        style={{
          width:36,
          height:36,
          borderRadius:'50%',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          background:'rgba(255,255,255,0.15)',
          overflow:'hidden'
        }}
      >
        <img src={notifIcon} alt="Notifications" style={{width:'70%', height:'70%', objectFit:'contain', filter:'drop-shadow(0 0 2px rgba(0,0,0,0.4))'}} />
      </NavLink>
      <NavLink
        to={`/profile/${user.username}`}
        className={({isActive}:{isActive:boolean})=> isActive? 'active' : ''}
        title={`Profile: @${user.username}`}
        style={{
          width:38,
          height:38,
          borderRadius:'50%',
          background: user.avatarUrl ? 'transparent' : 'linear-gradient(135deg,#ff4fa3,#ff9bd2)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          color:'#fff',
          fontWeight:700,
          fontSize: user.avatarUrl ? 0 : '0.85rem',
          overflow:'hidden',
          boxShadow:'0 2px 6px rgba(0,0,0,0.35)'
        }}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
        ) : (
          user.firstName?.charAt(0) || user.username?.charAt(0) || '?'
        )}
      </NavLink>
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="hero-btn"
        style={{
          padding:'0.5rem 1rem',
          fontSize:'.7rem',
          background:'linear-gradient(135deg,#ff4fa3,#ff9bd2)',
          color:'#1a1d3a',
          border:'2px solid rgba(255,255,255,0.25)',
          fontWeight:700,
          letterSpacing:'.5px',
          textTransform:'uppercase'
        }}
      >Logout</button>
    </div>
  );
}
