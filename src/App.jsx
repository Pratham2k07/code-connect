import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { GlobalBackground } from './components/ui/GlobalBackground';
import { LandingPage } from './pages/LandingPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { MatchDashboard } from './pages/MatchDashboard';
import { CollaborationRoom } from './pages/CollaborationRoom';
import { RoomsList } from './pages/RoomsList';
import { FinalDecisionScreen } from './pages/FinalDecisionScreen';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-black min-h-screen font-mono text-sm z-50 relative">
          <h2 className="text-2xl font-bold mb-4">React crashed!</h2>
          <details className="whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-black text-textMain relative font-sans">
          <GlobalBackground />
          <Navbar />
          <main className="relative z-10 w-full flex flex-col items-center">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><MatchDashboard /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute><RoomsList /></ProtectedRoute>} />
              <Route path="/room/:id" element={<ProtectedRoute><CollaborationRoom /></ProtectedRoute>} />
              <Route path="/decision" element={<ProtectedRoute><FinalDecisionScreen /></ProtectedRoute>} />
            </Routes>
          </main>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
