import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VocabularyInput from './components/VocabularyInput';
import VocabularyReview from './components/VocabularyReview';
import UserProfile from './components/UserProfile';
import './App.css';
import { FaBook, FaUser, FaSignInAlt, FaUserPlus, FaClipboardList } from 'react-icons/fa';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <NavLink to="/" end activeClassName="active">
            <FaClipboardList className="icon" />
            Nhập Từ Vựng
          </NavLink>
          <NavLink to="/review" activeClassName="active">
            <FaBook className="icon" />
            Ôn Tập Từ Vựng
          </NavLink>
          <NavLink to="/profile" activeClassName="active">
            <FaUser className="icon" />
            Trang Cá Nhân
          </NavLink>
          <NavLink to="/login" activeClassName="active">
            <FaSignInAlt className="icon" />
            Đăng Nhập
          </NavLink>
          <NavLink to="/register" activeClassName="active">
            <FaUserPlus className="icon" />
            Đăng Ký
          </NavLink>
        </nav>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <VocabularyInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <VocabularyReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;