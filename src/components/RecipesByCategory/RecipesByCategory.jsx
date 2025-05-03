import RecipeList from "../Recipes/RecipeList.jsx";
import './RecipesByCategory.scss';

const RecipesByCategory = ({categoryName, recipes = []}) => {
    return (
        <section className="latest">
            <div className="title">
                <h2>{categoryName} Recipes</h2>
                <a href={`/categories/${categoryName}`}>View More</a>
            </div>
            <RecipeList recipes={recipes} categoryName={categoryName}/>
        </section>
    );
};

export default RecipesByCategory;