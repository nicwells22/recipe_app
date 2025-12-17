import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import RecipeNew from '@/pages/RecipeNew';
import RecipeEdit from '@/pages/RecipeEdit';
import Folders from '@/pages/Folders';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/new" element={<RecipeNew />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<RecipeEdit />} />
        <Route path="/folders" element={<Folders />} />
      </Routes>
    </Layout>
  );
}
