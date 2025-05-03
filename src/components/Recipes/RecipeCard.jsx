import "./Recipes.scss";

const RecipeCard = ({recipe}) => {
    return (
        <div className="card">
            <a href={`/recipe/${recipe.id}`}>
                <div>
                    <img src={recipe.image_url} alt={recipe.name}/>
                </div>
                <div className="title">
                    {recipe.name}
                </div>
            </a>
        </div>
    );
};

export default RecipeCard;