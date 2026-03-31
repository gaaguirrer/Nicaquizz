import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Paginas
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import ProposeQuestion from './pages/ProposeQuestion';
import Ranking from './pages/Ranking';
import AdminPanel from './pages/AdminPanel';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Challenge from './pages/Challenge';
import Trade from './pages/Trade';
import History from './pages/History';
import Account from './pages/Account';
import PlayMode from './pages/PlayMode';

// Componente para rutas protegidas
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/play" />;
}

// Componente para rutas de admin
function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  if (!userData?.isAdmin) {
    return <Navigate to="/play" />;
  }

  return children;
}

// Componente para redirigir usuarios autenticados
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  return currentUser ? <Navigate to="/play" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas publicas */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/play"
        element={
          <PrivateRoute>
            <PlayMode />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path="/questions/:categoryId"
        element={
          <PrivateRoute>
            <Questions />
          </PrivateRoute>
        }
      />
      <Route
        path="/propose"
        element={
          <PrivateRoute>
            <ProposeQuestion />
          </PrivateRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <PrivateRoute>
            <Ranking />
          </PrivateRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <PrivateRoute>
            <Shop />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <PrivateRoute>
            <Friends />
          </PrivateRoute>
        }
      />
      <Route
        path="/challenge/:challengeId"
        element={
          <PrivateRoute>
            <Challenge />
          </PrivateRoute>
        }
      />
      <Route
        path="/trade"
        element={
          <PrivateRoute>
            <Trade />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        }
      />
      <Route
        path="/account"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />

      {/* Ruta de admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/play" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
