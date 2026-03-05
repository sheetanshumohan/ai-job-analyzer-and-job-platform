import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import your provider
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

function App() {
  return (
    // The Provider MUST be the parent of any component using useContext
    <AuthProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;