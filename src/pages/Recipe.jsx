// src/pages/Recipe.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import Fraction from 'fraction.js';
import pluralize from 'pluralize';
import "../components/Recipes/Recipes.scss";

const Recipe = () => {
    const { slug } = useParams();          // ← grab slug instead of id
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [multiplier, setMultiplier] = useState(1);

    function scaleIngredient(ingStr) {
        // 1) Split off leading quantity (mixed or simple) from the rest
        const match = ingStr.match(/^([\d]+\s*\d*\/?\d*)\s+(.*)$/);
        if (!match) return ingStr;
        const [_, qtyStr, restPart] = match;

        // 2) Parse that quantity exactly as a fraction
        let fraction;
        try {
            fraction = new Fraction(qtyStr);
        } catch {
            return ingStr; // if parsing fails, bail out
        }

        // 3) Multiply in the fraction domain (exact! no floats)
        const scaledF = fraction.mul(multiplier);

        // 4) Extract numerator (n) and denominator (d) as BigInt
        //    fraction.js stores sign in .s, numerator in .n, denominator in .d
        const n = scaledF.s * scaledF.n; // BigInt
        const d = scaledF.d;             // BigInt

        // 5) Compute whole part and remainder
        const whole = n / d;    // integer division, BigInt
        const rem = n % d;    // BigInt remainder

        // 6) Format mixed‑fraction string
        let prettyQty;
        if (rem === 0n) {
            // e.g. “2”
            prettyQty = whole.toString();
        } else if (whole === 0n) {
            // e.g. “2/3”
            prettyQty = `${rem.toString()}/${d.toString()}`;
        } else {
            // e.g. “1 2/3”
            prettyQty = `${whole.toString()} ${rem.toString()}/${d.toString()}`;
        }

        // 7) Split the first word of restPart as the “unit”
        const [unit, ...desc] = restPart.trim().split(/\s+/);

        // 8) Pluralize the unit only if the scaled numeric value > 1
        //    and if it’s not an adjective (we skip words ending in “ing”)
        const numericValue = Number(n) / Number(d);
        const unitScaled =
            unit.toLowerCase().endsWith('ing')
                ? unit
                : (numericValue > 1 ? pluralize(unit) : unit);

        // 9) Reassemble and return
        return `${prettyQty} ${unitScaled}${desc.length ? ' ' + desc.join(' ') : ''}`;
    }

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

                    <div className="servings-control">
                        <button onClick={() => setMultiplier(1)} className={multiplier === 1 ? 'active' : ''}>1×
                        </button>
                        <button onClick={() => setMultiplier(2)} className={multiplier === 2 ? 'active' : ''}>2×
                        </button>
                        <button onClick={() => setMultiplier(3)} className={multiplier === 3 ? 'active' : ''}>3×
                        </button>
                    </div>

                    <div className="ingredients">
                        <h4>Ingredients</h4>
                        <ul>
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i}>{scaleIngredient(ing)}</li>
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