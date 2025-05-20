// src/pages/Recipe.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import Fraction from 'fraction.js';
import pluralize from 'pluralize';
import "../components/Recipes/Recipes.scss";
import StarRatingDisplay from "../components/Ratings/StarRatingDisplay.jsx";

const Recipe = () => {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [ratingSummary, setRatingSummary] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [sessionUser, setSessionUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [multiplier, setMultiplier] = useState(1);

    function scaleIngredient(ingStr) {
        const unicodeMap = {'¼': '1/4', '½': '1/2', '¾': '3/4', '⅓': '1/3', '⅔': '2/3', '⅛': '1/8', '⅜': '3/8'};
        for (const [u, a] of Object.entries(unicodeMap)) {
            ingStr = ingStr.replaceAll(u, a);
        }

        const match = ingStr.match(/^([\d\s/]+(?:[–-][\d\s/]+)?)\s+(.*)$/);
        if (!match) return ingStr;

        let [, qtyPart, restPart] = match;

        const scaleOne = (q) => {
            let f;
            try { f = new Fraction(q.trim()); } catch { return q.trim(); }
            const scaled = f.mul(multiplier);
            const n = scaled.s * scaled.n;
            const d = scaled.d;
            const whole = n / d;
            const rem = n % d;

            if (rem === 0n) return whole.toString();
            if (whole === 0n) return `${rem.toString()}/${d.toString()}`;
            return `${whole.toString()} ${rem.toString()}/${d.toString()}`;
        };

        let prettyQty;
        const rangeMatch = qtyPart.match(/^(.+?)[–-](.+)$/);
        if (rangeMatch) {
            const [, a, b] = rangeMatch;
            prettyQty = `${scaleOne(a)}-${scaleOne(b)}`;
        } else {
            prettyQty = scaleOne(qtyPart);
        }

        const [unit, ...desc] = restPart.trim().split(/\s+/);
        const numeric = rangeMatch
            ? (Number(new Fraction(rangeMatch[1])) + Number(new Fraction(rangeMatch[2]))) / 2 * multiplier
            : Number(new Fraction(qtyPart)) * multiplier;

        const unitScaled = unit.toLowerCase().endsWith('ing') ? unit : (numeric > 1 ? pluralize(unit) : unit);
        return `${prettyQty} ${unitScaled}${desc.length ? ' ' + desc.join(' ') : ''}`;
    }

    useEffect(() => {
        async function fetchRecipe() {
            setLoading(true);

            const { data: recipeData, error: recipeError } = await supabase
                .from("recipes")
                .select(`*,
                    categories ( id, name ),
                    ingredient_sections (
                        id,
                        title,
                        ordering,
                        recipe_ingredients ( id, description, ordering )
                    ),
                    recipe_directions ( id, description, ordering )`)
                .eq("slug", slug)
                .single();

            if (recipeError) {
                setError(recipeError);
                setLoading(false);
                return;
            }

            setRecipe(recipeData);

            const { data: ratingData } = await supabase
                .from("recipe_review_summary")
                .select("average_rating, rating_count")
                .eq("recipe_id", recipeData.id)
                .single();

            setRatingSummary(ratingData);

            const { data: auth } = await supabase.auth.getUser();
            const user = auth?.user;
            setSessionUser(user);

            if (user) {
                const { data: existing } = await supabase
                    .from("recipe_reviews")
                    .select("rating")
                    .eq("recipe_id", recipeData.id)
                    .eq("user_id", user.id)
                    .single();

                if (existing) setUserRating(existing.rating);
            }

            setLoading(false);
        }

        fetchRecipe();
    }, [slug]);

    if (loading) return <p>Loading…</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!recipe) return <p>No recipe found.</p>;

    return (
        <div className="recipe">
            <div className="container">
                <div className="image-col">
                    <img src={recipe.image_url} alt={recipe.name} loading="lazy" />
                </div>

                <div className="details-col">
                    <h1>{recipe.name}</h1>
                    <div className="category">{recipe.categories.name}</div>
                    <StarRatingDisplay rating={parseFloat(ratingSummary?.average_rating || 0)} />
                    {ratingSummary?.rating_count > 0 ? (
                        <p style={{ color: "#777", fontSize: "0.9rem" }}>
                            Based on {ratingSummary.rating_count} {ratingSummary.rating_count === 1 ? 'rating' : 'ratings'}
                        </p>
                    ) : (
                        <p style={{ color: "#777", fontSize: "0.9rem" }}>No ratings yet</p>
                    )}

                    <div className="description">
                        <h4>Description</h4>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="servings-control">
                        {[1, 2, 3].map(n => (
                            <button
                                key={n}
                                onClick={() => setMultiplier(n)}
                                className={multiplier === n ? "active" : ""}
                            >{n}×</button>
                        ))}
                    </div>

                    <div className="ingredients">
                        <h4>Ingredients</h4>
                        {recipe.ingredient_sections.sort((a, b) => a.ordering - b.ordering).map(section => (
                            <div key={section.id} className="ingredient-section">
                                <h5>{section.title}</h5>
                                <ul>
                                    {section.recipe_ingredients.sort((a, b) => a.ordering - b.ordering).map(item => (
                                        <li key={item.id}>{scaleIngredient(item.description)}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="directions">
                        <h4>Directions</h4>
                        <ol>
                            {recipe.recipe_directions.sort((a, b) => a.ordering - b.ordering).map(step => (
                                <li key={step.id}>{step.description}</li>
                            ))}
                        </ol>
                    </div>

                    {sessionUser ? (
                        <div className="user-rating">
                            <h4>Your Rating</h4>
                            <StarRatingDisplay
                                rating={userRating || 0}
                                editable={true}
                                onRate={async (newRating) => {
                                    setUserRating(newRating);
                                    await supabase.from("recipe_reviews").upsert({
                                        recipe_id: recipe.id,
                                        user_id: sessionUser.id,
                                        rating: newRating
                                    }, { onConflict: ['recipe_id', 'user_id'] });

                                    const { data: updatedSummary } = await supabase
                                        .from("recipe_rating_summary")
                                        .select("average_rating, rating_count")
                                        .eq("recipe_id", recipe.id)
                                        .single();

                                    setRatingSummary(updatedSummary);
                                }}
                            />
                        </div>
                    ) : (
                        <p style={{ marginTop: "2rem", color: "#666", fontStyle: "italic" }}>
                            Log in to rate this recipe.
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Recipe;
