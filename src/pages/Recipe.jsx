// src/pages/Recipe.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import Fraction from 'fraction.js';
import pluralize from 'pluralize';
import "../components/Recipes/Recipes.scss";

const Recipe = () => {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [multiplier, setMultiplier] = useState(1);

    // (unchanged) your scaleIngredient helper
    function scaleIngredient(ingStr) {
        const match = ingStr.match(/^([\d]+\s*\d*\/?\d*)\s+(.*)$/);
        if (!match) return ingStr;
        const [_, qtyStr, restPart] = match;
        let fraction;
        try { fraction = new Fraction(qtyStr); } catch { return ingStr; }
        const scaledF = fraction.mul(multiplier);
        const n = scaledF.s * scaledF.n;
        const d = scaledF.d;
        const whole = n / d;
        const rem   = n % d;
        let prettyQty;
        if (rem === 0n) prettyQty = whole.toString();
        else if (whole === 0n) prettyQty = `${rem.toString()}/${d.toString()}`;
        else prettyQty = `${whole.toString()} ${rem.toString()}/${d.toString()}`;
        const [unit, ...desc] = restPart.trim().split(/\s+/);
        const numericValue = Number(n) / Number(d);
        const unitScaled =
            unit.toLowerCase().endsWith('ing')
                ? unit
                : (numericValue > 1 ? pluralize(unit) : unit);
        return `${prettyQty} ${unitScaled}${desc.length ? ' ' + desc.join(' ') : ''}`;
    }

    useEffect(() => {
        async function fetchRecipe() {
            setLoading(true);
            const { data, error } = await supabase
                .from("recipes")
                .select(`
          *,
          categories ( id, name ),
          ingredient_sections (
            id,
            title,
            ordering,
            recipe_ingredients (
              id,
              description,
              ordering
            )
          ),
          recipe_directions (
            id,
            description,
            ordering
          )
        `)
                .eq("slug", slug)
                .single();

            if (error) {
                console.error("Error fetching recipe:", error);
                setError(error);
            } else {
                setRecipe(data);
            }
            setLoading(false);
        }
        fetchRecipe();
    }, [slug]);

    if (loading) return <p>Loading…</p>;
    if (error)   return <p>Error: {error.message}</p>;
    if (!recipe) return <p>No recipe found.</p>;

    return (
        <div className="recipe">
            <div className="container">
                {/* Image column */}
                <div className="image-col">
                    <img src={recipe.image_url} alt={recipe.name} loading="lazy" />
                </div>

                {/* Details column */}
                <div className="details-col">
                    <h1>{recipe.name}</h1>
                    <div className="category">{recipe.categories.name}</div>

                    <div className="description">
                        <h4>Description</h4>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="servings-control">
                        {[1,2,3].map(n => (
                            <button
                                key={n}
                                onClick={() => setMultiplier(n)}
                                className={multiplier===n ? "active" : ""}
                            >{n}×</button>
                        ))}
                    </div>

                    <div className="ingredients">
                        <h4>Ingredients</h4>
                        {recipe.ingredient_sections
                            .sort((a,b) => a.ordering - b.ordering)
                            .map(section => (
                                <div key={section.id} className="ingredient-section">
                                    <h5>{section.title}</h5>
                                    <ul>
                                        {section.recipe_ingredients
                                            .sort((a,b) => a.ordering - b.ordering)
                                            .map(item => (
                                                <li key={item.id}>
                                                    {scaleIngredient(item.description)}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            ))
                        }
                    </div>

                    <div className="directions">
                        <h4>Directions</h4>
                        <ol>
                            {recipe.recipe_directions
                                .sort((a,b) => a.ordering - b.ordering)
                                .map(step => (
                                    <li key={step.id}>{step.description}</li>
                                ))
                            }
                        </ol>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Recipe;
