import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import AddRecipeModal from "./components/AddRecipeModal";
import RecipesPage from "./pages/RecipesPage";
import MealPlanPage from "./pages/MealPlanPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import SettingsPage from "./pages/SettingsPage";

function AppShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  function openAddRecipe() {
    navigate("/");
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page content — padded so it clears the bottom nav */}
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <Routes>
          <Route path="/" element={<RecipesPage onAddRecipe={openAddRecipe} />} />
          <Route path="/plan" element={<MealPlanPage />} />
          <Route path="/shopping" element={<ShoppingListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>

      <BottomNav onAddRecipe={openAddRecipe} />
      <AddRecipeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
