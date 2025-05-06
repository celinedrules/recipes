// src/pages/Home.jsx
import {useEffect, useMemo, useState} from "react";
import Hero from "../components/Hero/Hero.jsx";
import Categories from "../components/Categories/Categories.jsx";
import {supabase} from "../lib/supabase.js";
import Latest from "../components/Latest/Latest.jsx";
import SubmitRecipe from "../components/SubmitRecipe/SubmitRecipe.jsx";

const Home = ({categories}) => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        async function fetchRecipes() {
            const {data, error} = await supabase
                .from('recipes')
                // ← slug added here
                .select('id, name, slug, category_id, image_url, created_at')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error loading latest recipes:', error);
            } else {
                setRecipes(data);
            }
        }
        fetchRecipes();
    }, []);

    const latestThree = useMemo(() => recipes.slice(0, 3), [recipes]);

    return (
        <div>
            <Hero/>
            <Categories categories={categories}/>
            <Latest latest={latestThree}/>
            <SubmitRecipe/>
        </div>
    );
};

export default Home;