
import React, { useState, useEffect } from 'react';
import { Book, Plus, StickyNote } from 'lucide-react';

const NotesApp = () => {
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('xp_notes');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Welcome', content: 'This is your digital notebook.' }
        ];
    });
    const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id);

    useEffect(() => {
        localStorage.setItem('xp_notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = () => {
        const newNote = { id: Date.now(), title: 'New Note', content: '' };
        setNotes([...notes, newNote]);
        setActiveNoteId(newNote.id);
    };

    const updateNote = (id, field, value) => {
        setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div style={{ height: '100%', display: 'flex', background: '#fff' }}>
            <div style={{ width: '200px', background: '#f0f0f0', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px', background: '#4e5ba6', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Notebook</span>
                    <Plus size={16} style={{ cursor: 'pointer' }} onClick={addNote} />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #ddd',
                                cursor: 'pointer',
                                background: activeNoteId === note.id ? '#fff' : 'transparent',
                                borderLeft: activeNoteId === note.id ? '4px solid #4e5ba6' : 'none'
                            }}
                        >
                            <div style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || 'Untitled'}</div>
                            <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.content.substring(0, 30) || 'No content'}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff9c4' }}>
                {activeNote ? (
                    <>
                        <input
                            style={{ width: '100%', padding: '15px', fontSize: '20px', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
                            value={activeNote.title}
                            onChange={e => updateNote(activeNote.id, 'title', e.target.value)}
                            placeholder="Title"
                        />
                        <textarea
                            style={{ flex: 1, width: '100%', padding: '15px', fontSize: '14px', border: 'none', background: 'transparent', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                            value={activeNote.content}
                            onChange={e => updateNote(activeNote.id, 'content', e.target.value)}
                            placeholder="Start typing..."
                        />
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Select or create a note</div>
                )}
            </div>
        </div>
    );
};

export default NotesApp;
