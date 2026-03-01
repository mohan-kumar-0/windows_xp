
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const TodoApp = () => {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('xp_todos');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('xp_todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ padding: '15px', background: 'linear-gradient(to bottom, #7ba3e7, #638ada)', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>Tasks</h2>
            </div>
            <form onSubmit={addTodo} style={{ padding: '15px', display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
                <input
                    style={{ flex: 1, padding: '8px', border: '1px solid #7f9db9', outline: 'none' }}
                    placeholder="What needs to be done?"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button style={{ padding: '8px 15px', background: '#ece9d8', border: '1px solid #999', cursor: 'pointer' }}>Add Task</button>
            </form>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {todos.length === 0 && <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>No tasks yet!</div>}
                {todos.map(todo => (
                    <div key={todo.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        background: todo.completed ? '#f9f9f9' : 'transparent'
                    }}>
                        <div onClick={() => toggleTodo(todo.id)} style={{ cursor: 'pointer' }}>
                            {todo.completed ? <CheckCircle size={20} color="#46ac46" /> : <Circle size={20} color="#999" />}
                        </div>
                        <span style={{
                            flex: 1,
                            fontSize: '14px',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? '#999' : '#333'
                        }}>{todo.text}</span>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => deleteTodo(todo.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoApp;
