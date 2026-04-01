import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Paginas - Lazy loading para code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Categories = lazy(() => import('./pages/Categories'));
const Questions = lazy(() => import('./pages/Questions'));
const ProposeQuestion = lazy(() => import('./pages/ProposeQuestion'));
const Ranking = lazy(() => import('./pages/Ranking'));
const RankingConnected = lazy(() => import('./pages/RankingConnected'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Shop = lazy(() => import('./pages/Shop'));
const ShopConnected = lazy(() => import('./pages/ShopConnected'));
const Profile = lazy(() => import('./pages/Profile'));
const Friends = lazy(() => import('./pages/Friends'));
const FriendsConnected = lazy(() => import('./pages/FriendsConnected'));
const Challenge = lazy(() => import('./pages/Challenge'));
const ChallengeConnected = lazy(() => import('./pages/ChallengeConnected'));
const Trade = lazy(() => import('./pages/Trade'));
const TradeConnected = lazy(() => import('./pages/TradeConnected'));
const History = lazy(() => import('./pages/History'));
const HistoryConnected = lazy(() => import('./pages/HistoryConnected'));
const Account = lazy(() => import('./pages/Account'));
const AccountConnected = lazy(() => import('./pages/AccountConnected'));
const PlayMode = lazy(() => import('./pages/PlayMode'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#fefccf] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-[#154212]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#2D5A27] rounded-full border-t-transparent animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#2D5A27] text-3xl">restaurant</span>
          </span>
        </div>
        <p className="text-[#154212] font-bold font-headline text-lg animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}

// Componente para rutas protegidas
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return currentUser ? children : <Navigate to="/play" />;
}

// Componente para rutas de admin
function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
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
    return <PageLoader />;
  }

  return currentUser ? <Navigate to="/play" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas publicas */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<PageLoader />}>
            <Landing />
          </Suspense>
        } 
      />
      <Route
        path="/auth"
        element={
          <Suspense fallback={<PageLoader />}>
            <PublicRoute>
              <Auth />
            </PublicRoute>
          </Suspense>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/play"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <PlayMode />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/categories"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/questions/:categoryId"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Questions />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/propose"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <ProposeQuestion />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/ranking"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <RankingConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/ranking-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Ranking />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/shop"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <ShopConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/shop-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Shop />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/friends"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <FriendsConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/friends-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/challenge/:challengeId"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <ChallengeConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/challenge-old/:challengeId"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Challenge />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/trade"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <TradeConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/trade-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Trade />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/history"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <HistoryConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/history-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <History />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/account"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <AccountConnected />
            </PrivateRoute>
          </Suspense>
        }
      />
      <Route
        path="/account-old"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivateRoute>
              <Account />
            </PrivateRoute>
          </Suspense>
        }
      />

      {/* Ruta de admin */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          </Suspense>
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
