import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import PlaylistDetail from './pages/PlaylistDetail';
import Profile from './pages/Profile';
import AiLearning from './pages/AiLearning';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import AboutCreators from './pages/AboutCreators';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute>
          <Layout>
            <MyCourses />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/playlist/:id" element={
        <ProtectedRoute>
          <Layout>
            <PlaylistDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/ai-learning" element={
        <ProtectedRoute>
          <Layout>
            <AiLearning />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/about-creators" element={
        <ProtectedRoute>
          <Layout>
            <AboutCreators />
          </Layout>
        </ProtectedRoute>
      } />
    </>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
