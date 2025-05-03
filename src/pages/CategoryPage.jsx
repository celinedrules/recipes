import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RecipeList from "../components/Recipes/RecipeList.jsx";

export default function CategoryPage() {
    const { categoryName } = useParams();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // 1) look up the category row to get its numeric ID
                const { data: cat, error: catErr } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("name", categoryName)
                    .single();
                if (catErr) throw catErr;
                if (!cat) return setRecipes([]); // no such category

                // 2) now fetch only recipes in that category
                const { data: recs, error: recErr } = await supabase
                    .from("recipes")
                    .select("*")
                    .eq("category_id", cat.id)
                    .order("name", { ascending: true });
                if (recErr) throw recErr;

                setRecipes(recs);
            } catch (error) {
                console.error("Error loading recipes:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [categoryName]);

    if (loading) return <div>Loading…</div>;
    if (!recipes.length)
        return <p>No recipes found in “{categoryName}.”</p>;

    return (
        <div className="category-page">
            <h1>{categoryName} Recipes</h1>
            <RecipeList recipes={recipes} />
        </div>
    );
}