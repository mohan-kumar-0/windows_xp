
import React from 'react';
import { Layout } from 'lucide-react';

const Solitaire = () => {
    return (
        <div style={{ height: '100%', width: '100%', background: '#076324', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '15px' }}>
                <div style={{ width: '80px', height: '110px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '5px' }}></div>
                <div style={{ width: '80px', height: '110px', background: 'white', borderRadius: '5px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '70px', height: '100px', border: '1px solid #245edb', borderRadius: '3px', background: 'repeating-linear-gradient(45deg, #245edb, #245edb 5px, #3f8cf3 5px, #3f8cf3 10px)' }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '150px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '-80px' }}>
                        <div style={{ width: '80px', height: '110px', background: 'white', border: '1px solid #ddd', borderRadius: '5px', boxShadow: '1px 1px 3px rgba(0,0,0,0.3)', padding: '5px', color: (i % 2 === 0 ? 'red' : 'black') }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{i}</div>
                            <div style={{ fontSize: '24px', textAlign: 'center', marginTop: '20px' }}>{i % 2 === 0 ? '♥' : '♠'}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '50px', fontSize: '14px', opacity: 0.8 }}>Solitaire (Classic)</div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>Full functionality coming in SP3</div>
        </div>
    );
};

export default Solitaire;
