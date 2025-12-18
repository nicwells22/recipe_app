import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import RecipeNew from '@/pages/RecipeNew';
import RecipeEdit from '@/pages/RecipeEdit';
import Folders from '@/pages/Folders';
import Admin from '@/pages/Admin';
import { useAuthStore } from '@/stores/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/recipes" replace /> : <Login />} />
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/recipes/new" element={<ProtectedRoute><RecipeNew /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeEdit /></ProtectedRoute>} />
        <Route path="/folders" element={<ProtectedRoute><Folders /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
