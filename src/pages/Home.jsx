import {useEffect, useMemo, useState} from "react";
import Hero from "../components/Hero/Hero.jsx";
import Categories from "../components/Categories/Categories.jsx";
import {supabase} from "../lib/supabase.js";
import Latest from "../components/Latest/Latest.jsx";
import RecipesByCategory from "../components/RecipesByCategory/RecipesByCategory.jsx";
import SubmitRecipe from "../components/SubmitRecipe/SubmitRecipe.jsx";

const Home = ({categories}) => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        async function fetchRecipes() {
            const {data, error} = await supabase
                .from('recipes')
                .select('id, name, category_id, image_url, created_at')
                .order('created_at', {ascending: false})

            if (error) {
                console.error('Error loading latest recipes:', error)
            } else {
                setRecipes(data)
            }
        }

        fetchRecipes();
    }, []);

    const latestThree = useMemo(() => {
        return recipes.slice(0, 3);
    }, [recipes]);

    const latestIds = useMemo(
        () => new Set(latestThree.map(r => r.id)),
        [latestThree]
    );

    return (
        <div>
            <Hero/>
            <Categories categories={categories}/>
            <Latest latest={latestThree}/>
            {categories.map(cat => {
                const prettyName =
                    cat.name.charAt(0).toUpperCase() + cat.name.slice(1);

                const recipesForThisCat = recipes.filter(
                    r => r["category_id"] === cat.id
                );

                const filtered = recipesForThisCat.filter(
                    r => !latestIds.has(r.id)
                );

                return (
                    filtered.length > 0 && (
                        <div key={cat.id}>
                            <p>{prettyName}: {filtered.length} recipes</p>
                            <RecipesByCategory
                                categoryName={prettyName}
                                recipes={filtered}
                            />
                        </div>
                    )
                );
            })}
            <SubmitRecipe/>
        </div>
    );
};

export default Home;