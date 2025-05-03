import {useEffect, useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {supabase} from './lib/supabase'
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home.jsx";
import './styles/styles.scss';
import ExploreCategories from "./pages/ExploreCategories.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import Recipe from "./pages/Recipe.jsx";
import Footer from "./components/Footer/Footer.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RequireAuth from "./components/RequireAuth/RequireAuth.jsx";
import SignUp from "./pages/SignUp.jsx";

function App() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // fetch once on mount
        async function fetchCategories() {
            const {data, error} = await supabase
                .from('categories')
                .select('id, name, image_url')
                .order('name', {ascending: true})

            if (error) {
                console.error('Error loading categories:', error)
            } else {
                setCategories(data)
            }
        }

        fetchCategories();
    }, []);

    return (
        <Router>
            <div className="container">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home categories={categories}/>}/>
                    <Route path="categories" element={<ExploreCategories categories={categories}/>}/>
                    <Route path="categories/:categoryName" element={<CategoryPage/>}/>
                    <Route path="/recipe/:slug" element={<Recipe/>}/>
                    {/*<Route path="/submitPage" element={<SubmitPage/>}/>*/}
                    <Route
                        path="/submitPage"
                        element={
                            <RequireAuth>
                                <SubmitPage/>
                            </RequireAuth>
                        }
                    />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                </Routes>
                <Footer/>
            </div>
        </Router>
    )
}

export default App
