import React, {useState, useEffect, useRef} from 'react';
import {supabase} from '../lib/supabase';
import Reorder from "../utils/reorder.js";
import {
    DragDropContext,
    Droppable,
    Draggable
} from '@hello-pangea/dnd';
import "../components/SubmitRecipe/SubmitRecipe.scss";

const SubmitPage = () => {
    // form field state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // ingredients
    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const handleAddIngredient = () => {
        const trimmed = ingredientInput.trim();
        if (trimmed) {
            setIngredients((prev) => [...prev, trimmed]);
            setIngredientInput('');
        }
    };
    const handleRemoveIngredient = (idx) => {
        setIngredients((prev) => prev.filter((_, i) => i !== idx));
    };

    // directions
    const [directionInput, setDirectionInput] = useState('');
    const [directions, setDirections] = useState([]);
    const handleAddDirection = () => {
        const trimmed = directionInput.trim();
        if (trimmed) {
            setDirections((prev) => [...prev, trimmed]);
            setDirectionInput('');
        }
    };
    const handleRemoveDirection = (idx) => {
        setDirections((prev) => prev.filter((_, i) => i !== idx));
    };
    const handleDragEnd = (result) => {
        const { source, destination} = result;
        if (!destination || source.index === destination.index) return;

        if (source.droppableId === 'directions') {
            setDirections(dirs => Reorder(dirs, source.index, destination.index));
        } else if (source.droppableId === 'ingredients') {
            setIngredients(ings => Reorder(ings, source.index, destination.index));
        }
    };

    // image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const fileInputRef = useRef(null);
    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageFileName(file.name);
        }
    };

    // categories from Supabase
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        async function fetchCategories() {
            const {data, error} = await supabase
                .from('categories')
                .select('id, name')
                .order('name', {ascending: true});
            if (error) console.error('Error loading categories:', error);
            else setCategories(data || []);
        }

        fetchCategories();
    }, []);

    // form submit
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
            const {data: publicData, error: publicError} = supabase
                .storage
                .from('recipe-images')
                .getPublicUrl(uploadData.path);
            if (publicError) console.error('Error getting public URL:', publicError);
            else imageUrl = publicData.publicUrl;
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
        <DragDropContext onDragEnd={handleDragEnd}>
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
                                onChange={(e) => setName(e.target.value)}
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
                                onChange={(e) => setDescription(e.target.value)}
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
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Category */}
                        <div className="group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ingredients */}
                        <div className="group array">
                            <label>Ingredients</label>
                            <div className="array-row">
                                <input
                                    type="text"
                                    placeholder="Enter ingredient"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                />
                                <button className="add" type="button" onClick={handleAddIngredient}>
                                    Add Ingredient
                                </button>
                            </div>
                            {ingredients.length > 0 && (
                                <Droppable droppableId="ingredients">
                                    {(provided) => (
                                        <ul
                                            className="item-list"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {ingredients.map((ing, idx) => (
                                                <Draggable key={`ing-${idx}`} draggableId={`ing-${idx}`} index={idx}>
                                                    {(prov, snap) => (
                                                        <li
                                                            ref={prov.innerRef}
                                                            {...prov.draggableProps}
                                                            {...prov.dragHandleProps}
                                                            className={snap.isDragging ? 'dragging' : ''}
                                                        >
                                                            <span>{ing}</span>
                                                            <button
                                                                type="button"
                                                                className="remove"
                                                                onClick={() => handleRemoveIngredient(idx)}
                                                            >
                                                                ×
                                                            </button>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            )}
                        </div>

                        {/* Directions with DnD */}
                        <div className="group array">
                            <label>Directions</label>
                            <div className="array-row">
                                <input
                                    type="text"
                                    placeholder="Enter direction step"
                                    value={directionInput}
                                    onChange={(e) => setDirectionInput(e.target.value)}
                                />
                                <button className="add" type="button" onClick={handleAddDirection}>
                                    Add Direction
                                </button>
                            </div>

                            {directions.length > 0 && (
                                <Droppable droppableId="directions">
                                    {(provided) => (
                                        <ol
                                            className="item-list"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {directions.map((dir, idx) => (
                                                <Draggable key={dir} draggableId={`dir-${idx}`} index={idx}>
                                                    {(prov, snap) => (
                                                        <li
                                                            ref={prov.innerRef}
                                                            {...prov.draggableProps}
                                                            {...prov.dragHandleProps}
                                                            className={snap.isDragging ? 'dragging' : ''}
                                                        >
                                                            <span>{dir}</span>
                                                            <button
                                                                type="button"
                                                                className="remove"
                                                                onClick={() => handleRemoveDirection(idx)}
                                                            >
                                                                ×
                                                            </button>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ol>
                                    )}
                                </Droppable>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="group array">
                            <label>Image</label>
                            <div className="array-row">
                                <input
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
                                accept="image/*"
                                ref={fileInputRef}
                                style={{display: 'none'}}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="submit-btn">
                            <button className="add" type="submit">Submit Recipe</button>
                        </div>

                    </form>
                </div>
            </div>
        </DragDropContext>
    );
};

export default SubmitPage;