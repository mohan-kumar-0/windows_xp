
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Download, Square, Circle, Minus, Pencil, Eraser } from 'lucide-react';

const PaintApp = ({ isMobile }) => {
    const canvasRef = useRef(null);
    const [color, setColor] = useState('#000000');
    const [tool, setTool] = useState('brush');
    const [brushSize, setBrushSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Set initial canvas size
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Fill with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        const coords = getCoords(e);
        setIsDrawing(true);
        setPrevPos(coords);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const coords = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');

        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(prevPos.x, prevPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        setPrevPos(coords);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.download = 'paint-drawing.png';
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    const colors = [
        '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
        '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ece9d8' }}>
            <div style={{ display: 'flex', padding: '5px', gap: '10px', background: '#ece9d8', borderBottom: '1px solid #999', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '2px', padding: '2px', border: '1px outset white', background: '#dcd9c8' }}>
                    <button onClick={() => setTool('brush')} style={{ padding: '4px', background: tool === 'brush' ? '#fff' : 'transparent', border: tool === 'brush' ? '1px inset #999' : '1px solid transparent' }} title="Brush"><Pencil size={16} /></button>
                    <button onClick={() => setTool('eraser')} style={{ padding: '4px', background: tool === 'eraser' ? '#fff' : 'transparent', border: tool === 'eraser' ? '1px inset #999' : '1px solid transparent' }} title="Eraser"><Eraser size={16} /></button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 10px', borderLeft: '1px solid #999' }}>
                    <span style={{ fontSize: '11px' }}>Size:</span>
                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: '80px' }} />
                </div>

                <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    <button onClick={clearCanvas} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: '#ece9d8', border: '1px outset white', fontSize: '11px' }}><Trash2 size={14} /> Clear</button>
                    <button onClick={downloadImage} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: '#ece9d8', border: '1px outset white', fontSize: '11px' }}><Download size={14} /> Save</button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '60px', background: '#ece9d8', borderRight: '1px solid #999', padding: '5px', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 20px)', gap: '2px', padding: '2px', border: '2px inset white' }}>
                        {colors.map(c => (
                            <div
                                key={c}
                                onClick={() => setColor(c)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    background: c,
                                    border: '1px solid #808080',
                                    outline: color === c ? '1px solid black' : 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ marginTop: '10px', width: '30px', height: '30px', background: color, border: '2px inset white' }}></div>
                </div>

                <div style={{ flex: 1, background: '#808080', padding: '10px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{
                            background: 'white',
                            boxShadow: '3px 3px 5px rgba(0,0,0,0.3)',
                            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                            touchAction: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ background: '#ece9d8', padding: '2px 10px', borderTop: '1px solid #999', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>For Help, click Help Topics on the Help Menu.</span>
                <span>{prevPos.x}, {prevPos.y}px</span>
            </div>
        </div>
    );
};

export default PaintApp;
