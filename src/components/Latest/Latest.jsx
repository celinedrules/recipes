import RecipeCard from "../Recipes/RecipeCard.jsx";

const Latest = ({latest}) => {
    return (
        <section className="latest">
            <div className="title">
                <h2>Latest Recipes</h2>
                {/*<a href="/exploreLatest">View More</a>*/}
            </div>
            <div className="cards">
                {latest.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe}/>
                ))}
            </div>
        </section>
    );
};

export default Latest;