
import React, { useState, useEffect } from 'react';
import { Save, FilePlus, FolderPlus } from 'lucide-react';

const Notepad = ({ initialFile, onSave }) => {
    const [content, setContent] = useState(initialFile?.content || '');
    const [title, setTitle] = useState(initialFile?.name || 'Untitled.txt');

    useEffect(() => {
        if (initialFile) {
            setContent(initialFile.content || '');
            setTitle(initialFile.name || 'Untitled.txt');
        }
    }, [initialFile]);

    const handleSave = () => {
        onSave({ ...initialFile, name: title, content });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ background: '#ece9d8', padding: '2px 5px', borderBottom: '1px solid #999', display: 'flex', gap: '10px' }}>
                <div style={{ fontSize: '11px', padding: '2px 5px', cursor: 'pointer' }} onClick={handleSave}>File</div>
                <div style={{ fontSize: '11px', padding: '2px 5px', cursor: 'pointer' }}>Edit</div>
                <div style={{ fontSize: '11px', padding: '2px 5px', cursor: 'pointer' }}>Format</div>
                <div style={{ fontSize: '11px', padding: '2px 5px', cursor: 'pointer' }}>View</div>
                <div style={{ fontSize: '11px', padding: '2px 5px', cursor: 'pointer' }}>Help</div>
            </div>
            <div style={{ background: '#f0f0f0', padding: '5px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #ccc' }}>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 8px', background: '#ece9d8', border: '1px solid #999', fontSize: '11px' }}>
                    <Save size={14} /> Save
                </button>
                <div style={{ fontSize: '12px', color: '#666' }}>{title}</div>
            </div>
            <textarea
                style={{ flex: 1, width: '100%', border: 'none', padding: '10px', fontFamily: 'Courier New', outline: 'none', resize: 'none' }}
                value={content}
                onChange={e => setContent(e.target.value)}
            />
        </div>
    );
};

export default Notepad;
