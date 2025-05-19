import {useEffect, useMemo, useState} from "react";
import {supabase} from "../lib/supabase.js";
import Latest from "../components/Latest/Latest.jsx";

const ExploreLatest = () =>{
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecipes() {
            setLoading(true);
            const {data, error} = await supabase
                .from('recipes')
                .select('id, name, slug, category_id, image_url, created_at')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error loading latest recipes:', error);
            } else {
                setRecipes(data);
            }
            setLoading(false);
        }

        fetchRecipes();
    }, []);

    const latestTen = useMemo(() => recipes.slice(0, 10), [recipes]);

    return (
        <div>
            {loading ? (
                <p>Loading latest recipes...</p>
            ) : (
                <>
                    <h1>Explore the Latest Recipes</h1>
                    <p>Check out what’s fresh from the kitchen — newest recipes just added!</p>
                    <Latest latest={latestTen}/>
                </>
            )}
        </div>
    )
};

export default ExploreLatest;