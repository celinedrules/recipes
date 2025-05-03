import RecipeCard from "./RecipeCard.jsx";
import './Recipes.scss';

const RecipeList = ({recipes, categoryName}) => {
    return (
        <div className="cards">
            {recipes.length > 0 ? (
                recipes.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe}/>
                ))
            ) : (
                <p>No {categoryName} recipes found!</p>
            )}
        </div>
    );
};

export default RecipeList;