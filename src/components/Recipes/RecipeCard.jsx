import "./Recipes.scss";
import {Link} from "react-router-dom";

const RecipeCard = ({recipe}) => {
    return (
        <div className="card">
            <Link to={`/recipe/${recipe.id}`}>
                <div>
                    <img src={recipe.image_url} alt={recipe.name}/>
                </div>
                <div className="title">
                    {recipe.name}
                </div>
            </Link>
        </div>
    );
};

export default RecipeCard;