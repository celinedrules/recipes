// components/Recipes/RecipePrint.jsx
import "./RecipePrint.scss";

const RecipePrint = ({ recipe, scaleIngredient }) => (
    <div className="print-pdf-target">
        <div className="left">
            <img src={recipe.image_url} alt={recipe.name} crossOrigin="anonymous" />
            <h1>{recipe.name}</h1>
            <div className="meta">
                <p><strong>Category:</strong> {recipe.categories.name}</p>
            </div>

            <h2>Ingredients</h2>
            {recipe.ingredient_sections.sort((a, b) => a.ordering - b.ordering).map(section => (
                <div key={section.id}>
                    <h3>{section.title}</h3>
                    <ul>
                        {section.recipe_ingredients.sort((a, b) => a.ordering - b.ordering).map(item => (
                            <li key={item.id}>{scaleIngredient(item.description)}</li>
                        ))}
                    </ul>
                </div>
            ))}

            {recipe.notes && (
                <div className="notes">
                    <h3>Notes</h3>
                    <p>{recipe.notes}</p>
                </div>
            )}
        </div>

        <div className="right">
            <h2>Directions</h2>
            <ol>
                {recipe.recipe_directions.sort((a, b) => a.ordering - b.ordering).map(step => (
                    <li key={step.id}>{step.description}</li>
                ))}
            </ol>
        </div>
    </div>
);

export default RecipePrint;
