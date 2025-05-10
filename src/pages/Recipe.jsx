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
        // 0) normalize unicode fractions
        const unicodeMap = { '¼':'1/4','½':'1/2','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8','⅜':'3/8' };
        for (const [u,a] of Object.entries(unicodeMap)) {
            ingStr = ingStr.replaceAll(u, a);
        }

        // 1) Capture a qty (with optional range) and the rest
        //    Group1 = digits, spaces, slashes, then optionally – or - and more of same
        //    Group2 = the unit + description
        const match = ingStr.match(
            /^([\d\s/]+(?:[–-][\d\s/]+)?)\s+(.*)$/
        );
        if (!match) return ingStr;

        let [, qtyPart, restPart] = match;

        // helper: scale one qty-string (e.g. "1 1/3" or "2/3")
        const scaleOne = (q) => {
            let f;
            try { f = new Fraction(q.trim()); }
            catch { return q.trim(); }
            const scaled = f.mul(multiplier);    // uses closure multiplier
            const n = scaled.s * scaled.n;       // BigInt numerator
            const d = scaled.d;                  // BigInt denominator
            const whole = n / d;
            const rem   = n % d;

            if (rem === 0n) return whole.toString();
            if (whole === 0n) return `${rem.toString()}/${d.toString()}`;
            return `${whole.toString()} ${rem.toString()}/${d.toString()}`;
        };

        // 2) If it’s a range “A–B” or “A-B”, scale both ends
        let prettyQty;
        const rangeMatch = qtyPart.match(/^(.+?)[–-](.+)$/);
        if (rangeMatch) {
            const [ , a, b ] = rangeMatch;
            prettyQty = `${scaleOne(a)}-${scaleOne(b)}`;
        } else {
            prettyQty = scaleOne(qtyPart);
        }

        // 3) Pluralize the unit if numeric > 1, skip adjectives (“heaping”)
        const [unit, ...desc] = restPart.trim().split(/\s+/);
        // use midpoint for a range, or the single value
        const numeric = rangeMatch
            ? ( Number(new Fraction(rangeMatch[1])) + Number(new Fraction(rangeMatch[2])) )/2 * multiplier
            : Number(new Fraction(qtyPart)) * multiplier;

        const unitScaled =
            unit.toLowerCase().endsWith('ing')
                ? unit
                : (numeric > 1 ? pluralize(unit) : unit);

        // 4) Reassemble
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
