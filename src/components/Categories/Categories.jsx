import Category from "./Category.jsx";
import {Link} from "react-router-dom";
import './Categories.scss';

const Categories = ({categories}) => {
    return (
        <div className="categories">
            {categories.map((category) => (
                <Category key={category.name} category={category}/>
            ))}
            <Link to="/categories" className="link">
                <div>
                    <img src="/images/view-all.jpg" alt="View All"/>
                </div>
                <div className="title">View All</div>
            </Link>
        </div>
    );
};

export default Categories;