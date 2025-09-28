import { NavLink, Route, Routes, useNavigate, BrowserRouter } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import { UserStoreProvider } from './store/userStore';
import NotificationsPage from './pages/NotificationsPage';
import FriendsPage from './pages/FriendsPage';
import ChatPage from './pages/Chat';
import SignupPage from './pages/SignupPage';
import AIDemoPage from './pages/AIDemoPage'; // added

export default function App() {
  return (
    <UserStoreProvider>
      <BrowserRouter>
        <div>
          <NavBar />
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/gamemap" element={<GameMapPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/ai-demo" element={<AIDemoPage />} /> {/* added */}
            </Routes>
          </div>
          <footer>© {new Date().getFullYear()} Technova Networking • Empowering connection across gaming, tech, and sports</footer>
        </div>
      </BrowserRouter>
    </UserStoreProvider>
  );
}

function NavBar() {
  const user = useUserStore(s => s.user);
  const logout = useUserStore(s => s.logout);
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/friends', label: 'Friends' },
    { to: '/onboarding', label: 'Onboarding' },
    { to: '/settings', label: 'Settings' },
    { to: '/chat', label: 'Chat' },
    { to: '/ai-demo', label: 'AI Demo' }, // added
  ];
  return (
    <nav>
      <strong style={{marginRight:'1rem'}}>Technova</strong>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')}
        >
          {l.label}
        </NavLink>
      ))}
      {user && (
        <button
          style={{marginLeft:'auto', background:'#222a35', color:'#fff'}}
          onClick={() => { logout(); navigate('/'); }}
        >Logout</button>
      )}
    </nav>
  );
}
