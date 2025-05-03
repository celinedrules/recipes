import {useNavigate} from "react-router-dom";
import './SubmitRecipe.scss';

const SubmitRecipe = () => {
    const navigate = useNavigate();
    const handleSubmitButton = () => {
        navigate("/submitPage");
    }

    return (
        <section className="submit">
            <div className="publish">
                <img src="/images/publish-recipe.png" alt="publish-recipe" width="566" height="208" loading="lazy"/>
                <h1>Publish your recipe FREE today</h1>
                <div className="col">
                    <p>Reach thousands of food lovers instantly.</p>
                    <div className="btn">
                        <button onClick={handleSubmitButton}>Submit Recipe</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SubmitRecipe;