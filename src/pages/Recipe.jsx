// src/pages/Recipe.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import "../components/Recipes/Recipes.scss";

const Recipe = () => {
    const { slug } = useParams();          // ← grab slug instead of id
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("recipes")                 // your table name
                .select(`
          *,
          categories (
            id,
            name
          )
        `)
                .eq("slug", slug)                // ← filter by slug
                .single();                       // expect exactly one row

            if (error) {
                console.error("Error fetching recipe:", error);
                setError(error);
            } else {
                setRecipe(data);
            }

            setLoading(false);
        };

        fetchRecipe();
    }, [slug]);                            // ← re-run when slug changes

    if (loading)  return <p>Loading...</p>;
    if (error)    return <p>Error loading recipe: {error.message}</p>;
    if (!recipe)  return <p>No recipe found.</p>;

    return (
        <div className="recipe">
            <div className="container">
                {/* Image column */}
                <div className="image-col">
                    <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        loading="lazy"
                    />
                </div>

                {/* Details column */}
                <div className="details-col">
                    <h1>{recipe.name}</h1>
                    <div className="category">{recipe.categories.name}</div>

                    <div className="description">
                        <h4>Description</h4>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="ingredients">
                        <h4>Ingredients</h4>
                        <ul>
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="directions">
                        <h4>Directions</h4>
                        <ul>
                            {recipe.directions.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipe;