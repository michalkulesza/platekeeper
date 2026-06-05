import PageHeader from "../components/PageHeader";

interface RecipesPageProps {
  onAddRecipe: () => void;
}

export default function RecipesPage({ onAddRecipe }: RecipesPageProps) {
  return (
    <>
      <PageHeader title="Recipes" />
      <div className="flex flex-col items-center justify-center py-24 text-default-400 px-4 text-center">
        <p className="text-lg">No recipes yet.</p>
        <p className="text-sm mt-1">
          Tap the{" "}
          <button onClick={onAddRecipe} className="text-primary font-medium">
            + Add
          </button>{" "}
          button to import one.
        </p>
      </div>
    </>
  );
}
