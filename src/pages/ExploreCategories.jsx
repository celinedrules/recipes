import Category from "../components/Categories/Category.jsx";
import "../components/Categories/Categories.scss";

const ExploreCategories = ({categories}) => {
    return (
        <div>
            <h1>Categories</h1>
            <div className="categories-explore">
                {categories.map((category) => (
                    <Category key={category.name} category={category}/>
                ))}
            </div>
        </div>
    );
};

export default ExploreCategories;