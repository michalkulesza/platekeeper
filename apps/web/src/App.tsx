import { useEffect, useState } from "react";
import { ToastProvider } from "@heroui/react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import AddRecipeModal from "./components/AddRecipeModal";
import ProtectedRoute from "./components/ProtectedRoute";
import RecipesPage from "./pages/RecipesPage";
import MealPlanPage from "./pages/MealPlanPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import { listTags, Tag } from "./api/client";

function AppShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    listTags().then(setAllTags).catch(() => {});
  }, []);

  function handleTagCreated(tag: Tag) {
    setAllTags((prev) =>
      [...prev, tag].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  function openAddRecipe() {
    navigate("/");
    setModalOpen(true);
  }

  function handleRecipeSaved() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <Routes>
          <Route
            path="/"
            element={
              <RecipesPage
                onAddRecipe={openAddRecipe}
                refreshKey={refreshKey}
                allTags={allTags}
                onTagCreated={handleTagCreated}
              />
            }
          />
          <Route path="/plan" element={<MealPlanPage />} />
          <Route path="/shopping" element={<ShoppingListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav onAddRecipe={openAddRecipe} />
      <AddRecipeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleRecipeSaved}
        allTags={allTags}
        onTagCreated={handleTagCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider placement="bottom-center" />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
