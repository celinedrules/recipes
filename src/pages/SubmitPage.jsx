// src/pages/SubmitPage.jsx
import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import {supabase} from '../lib/supabase';
import Reorder from '../utils/reorder.js';
import {
    DragDropContext,
    Droppable,
    Draggable
} from '@hello-pangea/dnd';
import "../components/SubmitRecipe/SubmitRecipe.scss";

export default function SubmitPage() {
    const navigate = useNavigate();

    // form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);

    // ingredient sections
    const [sections, setSections] = useState([
        {
            id: `sec-${Date.now()}`,
            title: 'Main Ingredients',
            input: '',
            items: []
        }
    ]);

    // directions (flat)
    const [directionInput, setDirectionInput] = useState('');
    const [directions, setDirections] = useState([]);

    // image upload
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const fileInputRef = useRef(null);

    // fetch categories on mount
    useEffect(() => {
        supabase
            .from('categories')
            .select('id,name')
            .order('name', {ascending: true})
            .then(({data, error}) => {
                if (error) console.error(error);
                else setCategories(data || []);
            });
    }, []);

    // SECTION handlers
    const handleSectionTitleChange = (secId, text) => {
        setSections(secs =>
            secs.map(s => s.id === secId ? {...s, title: text} : s)
        );
    };
    const handleSectionInputChange = (secId, text) => {
        setSections(secs =>
            secs.map(s => s.id === secId ? {...s, input: text} : s)
        );
    };
    const handleAddSection = () => {
        setSections(secs => [
            ...secs,
            {id: `sec-${Date.now()}`, title: 'New Section', input: '', items: []}
        ]);
    };
    const handleRemoveSection = secId => {
        setSections(secs => secs.filter(s => s.id !== secId));
    };
    const handleAddItem = secId => {
        setSections(secs =>
            secs.map(s => {
                if (s.id !== secId) return s;
                const trimmed = s.input.trim();
                if (!trimmed) return s;
                return {...s, items: [...s.items, trimmed], input: ''};
            })
        );
    };
    const handleRemoveItem = (secId, idx) => {
        setSections(secs =>
            secs.map(s => s.id !== secId ? s : {...s, items: s.items.filter((_, i) => i !== idx)})
        );
    };

    // DIRECTIONS handlers
    const handleAddDirection = () => {
        const trimmed = directionInput.trim();
        if (!trimmed) return;
        setDirections(dirs => [...dirs, trimmed]);
        setDirectionInput('');
    };
    const handleRemoveDirection = idx => {
        setDirections(dirs => dirs.filter((_, i) => i !== idx));
    };

    // file browse
    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImageFileName(file.name);
    };

    // drag & drop
    const handleDragEnd = result => {
        const {source, destination} = result;
        if (!destination || source.index === destination.index) return;

        // ingredients within section
        const fromSec = sections.find(s => s.id === source.droppableId);
        if (fromSec) {
            setSections(secs =>
                secs.map(s => {
                    if (s.id !== source.droppableId) return s;
                    return {
                        ...s,
                        items: Reorder(s.items, source.index, destination.index)
                    };
                })
            );
            return;
        }

        // directions
        if (source.droppableId === 'directions') {
            setDirections(dirs => Reorder(dirs, source.index, destination.index));
        }
    };

    // submit handler
    const handleSubmit = async e => {
        e.preventDefault();

        // --- 0) get the current user
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
            console.error('Not logged in!', userErr);
            return;
        }
        const email = user.email;

        // --- 1) upload image file if any, then get public URL ---
        let imageUrl = null;
        if (imageFile) {
            const safeName = name.trim().replace(/\s+/g, '_');
            // upload
            const {
                data: uploadData,
                error: uploadError
            } = await supabase
                .storage
                .from('recipe-images')
                .upload(`user_chris/${safeName}/${imageFileName}`, imageFile);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return;
            }

            // retrieve public URL
            const {
                data: publicData,
                error: publicError
            } = supabase
                .storage
                .from('recipe-images')
                .getPublicUrl(uploadData.path);

            if (publicError) {
                console.error('Error getting public URL:', publicError);
            } else {
                imageUrl = publicData.publicUrl;
            }
        }

        // --- 2) insert recipe row ---
        const {data: rec, error: recErr} = await supabase
            .from('recipes')
            .insert([{
                name,
                description,
                email,
                category_id: categoryId,
                image_url: imageUrl
            }])
            .select('id, slug')
            .single();

        if (recErr) {
            console.error(recErr);
            return;
        }
        const recipeId = rec.id;

        // --- 3) insert ingredient sections & items ---
        for (let secIdx = 0; secIdx < sections.length; secIdx++) {
            const s = sections[secIdx];
            const {data: secRow, error: secErr} = await supabase
                .from('ingredient_sections')
                .insert([{
                    recipe_id: recipeId,
                    title: s.title,
                    ordering: secIdx
                }])
                .select('id')
                .single();

            if (secErr) {
                console.error(secErr);
                return;
            }

            const sectionId = secRow.id;
            if (s.items.length) {
                const toInsert = s.items.map((desc, i) => ({
                    section_id: sectionId,
                    description: desc,
                    ordering: i
                }));
                const {error: itemsErr} = await supabase
                    .from('recipe_ingredients')
                    .insert(toInsert);

                if (itemsErr) {
                    console.error(itemsErr);
                    return;
                }
            }
        }

        // --- 4) insert directions ---
        if (directions.length) {
            const dirRows = directions.map((text, i) => ({
                recipe_id: recipeId,
                description: text,
                ordering: i
            }));
            const {error: dirErr} = await supabase
                .from('recipe_directions')
                .insert(dirRows);

            if (dirErr) console.error(dirErr);
        }

        navigate(`/recipe/${rec.slug}`);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="submit">
                <div className="container">
                    <h1>Submit New Recipe</h1>
                    <form onSubmit={handleSubmit}
                          onKeyDown={e => {
                              if (e.key === 'Enter') {
                                  e.preventDefault()
                              }
                          }}
                    >

                        {/* Name / Description / Email / Category */}
                        <div className="group">
                            <label>Recipe Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter recipe name"
                            />
                        </div>
                        <div className="group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Enter description"
                            />
                        </div>
                        <div className="group">
                            <label>Category</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                            >
                                <option value="">Select category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ingredient Sections */}
                        <h4>Ingredients</h4>
                        {sections.map((sec) => (
                            <div key={sec.id} className="section-block">
                                <div className="section-header">
                                    <input
                                        className="section-title"
                                        value={sec.title}
                                        onChange={e => handleSectionTitleChange(sec.id, e.target.value)}
                                    />
                                    {sections.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-section"
                                            onClick={() => handleRemoveSection(sec.id)}
                                        >✕</button>
                                    )}
                                </div>

                                <div className="group array array-row">
                                    <input
                                        value={sec.input}
                                        onChange={e => handleSectionInputChange(sec.id, e.target.value)}
                                        placeholder="Enter ingredient"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddItem(sec.id)
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="add"
                                        onClick={() => handleAddItem(sec.id)}
                                    >Add
                                    </button>
                                </div>

                                <Droppable droppableId={sec.id}>
                                    {provided => (
                                        <ul
                                            className="item-list"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {sec.items.map((ing, i) => (
                                                <Draggable
                                                    key={`ing-${sec.id}-${i}`}
                                                    draggableId={`ing-${sec.id}-${i}`}
                                                    index={i}
                                                >
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
                                                                onClick={() => handleRemoveItem(sec.id, i)}
                                                            >×
                                                            </button>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="add-section"
                            onClick={handleAddSection}
                        >Add Section
                        </button>

                        {/* Directions */}
                        <div className="group array">
                            <label>Directions</label>
                            <div className="array-row">
                                <input
                                    value={directionInput}
                                    onChange={e => setDirectionInput(e.target.value)}
                                    placeholder="Enter direction step"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddDirection()
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="add"
                                    onClick={handleAddDirection}
                                >Add Direction
                                </button>
                            </div>

                            <Droppable droppableId="directions">
                                {provided => (
                                    <ol
                                        className="item-list"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {directions.map((step, i) => (
                                            <Draggable
                                                key={`dir-${i}`}
                                                draggableId={`dir-${i}`}
                                                index={i}
                                            >
                                                {(prov, snap) => (
                                                    <li
                                                        ref={prov.innerRef}
                                                        {...prov.draggableProps}
                                                        {...prov.dragHandleProps}
                                                        className={snap.isDragging ? 'dragging' : ''}
                                                    >
                                                        <span>{step}</span>
                                                        <button
                                                            type="button"
                                                            className="remove"
                                                            onClick={() => handleRemoveDirection(i)}
                                                        >×
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ol>
                                )}
                            </Droppable>
                        </div>

                        {/* Image Upload */}
                        <div className="group array">
                            <label>Image</label>
                            <div className="array-row">
                                <input
                                    readOnly
                                    placeholder="No file chosen"
                                    value={imageFileName}
                                />
                                <button
                                    type="button"
                                    className="add"
                                    onClick={handleBrowseClick}
                                >Browse
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

                        {/* Submit */}
                        <div className="submit-btn">
                            <button className="add" type="submit">
                                Submit Recipe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DragDropContext>
    );
}
