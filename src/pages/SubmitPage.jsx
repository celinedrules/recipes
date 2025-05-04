import React, {useState, useEffect, useRef} from 'react';
import {supabase} from '../lib/supabase';
import "../components/SubmitRecipe/SubmitRecipe.scss";

const SubmitPage = () => {
    // state for form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [directionInput, setDirectionInput] = useState('');
    const [directions, setDirections] = useState([]);

    // image upload states
    const [imageFile, setImageFile] = useState();
    const [imageFileName, setImageFileName] = useState('');
    const fileInputRef = useRef(null);

    // categories list
    const [categories, setCategories] = useState([]);

    // load categories from Supabase on mount
    useEffect(() => {
        async function fetchCategories() {
            const {data, error} = await supabase
                .from('categories')
                .select('id, name')
                .order('name', {ascending: true});

            if (error) {
                console.error('Error loading categories:', error);
            } else {
                setCategories(data);
            }
        }

        fetchCategories();
    }, []);

    // handle adding an ingredient to the list
    const handleAddIngredient = () => {
        const trimmed = ingredientInput.trim();
        if (trimmed) {
            setIngredients(prev => [...prev, trimmed]);
            setIngredientInput('');
        }
    };

    const handleRemoveIngredient = (idxToRemove) => {
        setIngredients(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    // handle adding a direction step
    const handleAddDirection = () => {
        const trimmed = directionInput.trim();
        if (trimmed) {
            setDirections(prev => [...prev, trimmed]);
            setDirectionInput('');
        }
    };

    const handleRemoveDirection = (idxToRemove) => {
        setDirections(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    // browse button click => open file picker
    const handleBrowseClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // update file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileName(file.name);
        }
    };

    // submit with user retrieved via getUser()
    const handleSubmit = async (e) => {
        e.preventDefault();

        const safeName = name.trim().replace(/\s+/g, '_');
        let imageUrl = null;
        if (imageFile) {
            const filePath = `user_chris/${safeName}/${imageFileName}`;
            const {data: uploadData, error: uploadError} = await supabase
                .storage
                .from('recipe-images')
                .upload(filePath, imageFile);
            if (uploadError) {
                console.error('Upload error:', uploadError);
                return;
            }
            // after a successful upload…
            const {data: publicData, error: publicError} = supabase
                .storage
                .from('recipe-images')
                .getPublicUrl(uploadData.path);

            if (publicError) {
                console.error('Error getting public URL:', publicError);
            } else {
                imageUrl = publicData.publicUrl;
            }
        }

        const {data: inserted, error: insertError} = await supabase
            .from('recipes')
            .insert([{
                name,
                description,
                email,
                category_id: categoryId,
                ingredients,
                directions,
                image_url: imageUrl
            }]);

        if (insertError) console.error('Error saving recipe:', insertError);
        else console.log('Recipe saved:', inserted);
    };


    return (
        <div className="submit">
            <div className="container">
                <h1>Submit New Recipe</h1>
                <form onSubmit={handleSubmit}>
                    {/* Recipe Name */}
                    <div className="group">
                        <label htmlFor="name">Recipe Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter recipe name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            rows={4}
                            placeholder="Enter description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label htmlFor="email">Your Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ingredients (array) */}
                    <div className="group array">
                        <label>Ingredients</label>
                        <div className="array-row">
                            <input
                                type="text"
                                placeholder="Enter ingredient"
                                value={ingredientInput}
                                onChange={e => setIngredientInput(e.target.value)}
                            />
                            <button
                                className="add"
                                type="button"
                                onClick={handleAddIngredient}
                            >
                                Add Ingredient
                            </button>
                        </div>
                        {ingredients.length > 0 && (
                            <ul className="item-list">
                                {ingredients.map((ing, idx) => (
                                    <li key={idx}>
                                        {ing}
                                        <button
                                            type="button"
                                            className="remove"
                                            onClick={() => handleRemoveIngredient(idx)}
                                            >
                                            x
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Directions (array) */}
                    <div className="group array">
                        <label>Directions</label>
                        <div className="array-row">
                            <input
                                type="text"
                                placeholder="Enter direction step"
                                value={directionInput}
                                onChange={e => setDirectionInput(e.target.value)}
                            />
                            <button className="add" type="button" onClick={handleAddDirection}>
                                Add Direction
                            </button>
                        </div>
                        {directions.length > 0 && (
                            <ol className="item-list">
                                {directions.map((ing, idx) => (
                                    <li key={idx}>
                                        {ing}
                                        <button
                                            type="button"
                                            className="remove"
                                            onClick={() => handleRemoveDirection(idx)}
                                        >
                                            x
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    {/* Image Browse */}
                    <div className="group array">
                        <label htmlFor="image_url">Image</label>
                        <div className="array-row">
                            <input
                                id="image_browse"
                                type="text"
                                placeholder="No file chosen"
                                readOnly
                                value={imageFileName}
                            />
                            <button className="add" type="button" onClick={handleBrowseClick}>
                                Browse
                            </button>
                        </div>
                        <input
                            type="file"
                            accept="image/"
                            ref={fileInputRef}
                            style={{display: "none"}}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="submit-btn">
                        <button className="add" type="submit">
                            Submit Recipe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitPage;