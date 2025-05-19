// Hero.jsx
import React, { useState, useEffect } from "react";
import { useNavigate }                from "react-router-dom";
import {supabase} from "../../lib/supabase.js";
import "./Hero.scss";

const Hero = () => {
    const navigate       = useNavigate();
    const [displayName, setDisplayName] = useState("");

    // helper to fetch the profile
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setDisplayName(data.display_name);
        }
    };

    useEffect(() => {
        // on mount, load session + profile
        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                fetchProfile(session.user.id);
            } else {
                setDisplayName("");
            }
        };
        load();

        // subscribe to auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user?.id) {
                    fetchProfile(session.user.id);
                } else {
                    setDisplayName("");   // clear on logout
                }
            }
        );

        // cleanup
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleExploreLatest = () => navigate("/exploreLatest");
    const handleGetRandomRecipe = async () => {
        const { data, error } = await supabase
            .rpc("get_random_recipe");

        if (error) {
            console.error("Failed to fetch random recipe:", error);
            return;
        }

        if (data && data.length > 0) {
            const recipe = data[0];
            navigate(`/recipe/${recipe.slug}`);
        }
    };

    return (
        <div className="hero">
            <div className="row">
                <div className="col">
                    <img src="/images/hero-image.png" alt="hero" />
                </div>
                <div className="col">
                    {/* show greeting only when we have a name */}
                    {displayName && (
                        <p className="greeting">Welcome back, {displayName}!</p>
                    )}

                    <h1>Huge Selection of delicious recipe ideas</h1>
                    <p>Explore our huge selection of delicious recipe ideas including: easy desserts, delicious vegan and vegetarian dinner ideas, gorgeous pasta recipes, quick bakes, family-friendly meals and gluten-free recipes.</p>
                    <div className="explore">
                        <button className="latest" onClick={handleExploreLatest}>
                            Explore Latest
                        </button>
                        <button className="random" onClick={handleGetRandomRecipe}>
                            Show Random
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
