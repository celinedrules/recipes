import {Link} from "react-router-dom";
import './Categories.scss';

const Category = ({category}) => {
    return (
        <Link to={`/categories/${category.name}`} className="link">
            <div>
                <img src={category.image_url} alt={category.name}/>
            </div>
            <div>
                {category.name}
            </div>
        </Link>
    );
};

export default Category;