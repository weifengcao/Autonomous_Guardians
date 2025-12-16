
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RouteManagement from './components/RouteManagement';
import RobotStatusView from './components/RobotStatusView';
import VideoFeed from './components/VideoFeed';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2>Guardian Eye</h2>
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={location.pathname === '/routes' ? 'active' : ''}>
            <Link to="/routes">Route Management</Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RouteManagement />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <div className="video-feed-container">
          <VideoFeed />
        </div>
        <div className="robot-status-container">
          <RobotStatusView />
        </div>
      </div>
    </div>
  );
}

export default App;
