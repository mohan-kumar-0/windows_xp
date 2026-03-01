
import React, { useState } from 'react';
import { RefreshCw, ArrowLeft, ArrowRight, Home, Search, Shield, ExternalLink } from 'lucide-react';

const Browser = () => {
    const defaultUrl = 'https://www.kumarmohan.com';
    const [url, setUrl] = useState(defaultUrl);
    const [frameUrl, setFrameUrl] = useState(defaultUrl);
    const [history, setHistory] = useState([defaultUrl]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const navigate = (newUrl) => {
        let formattedUrl = newUrl;
        if (!newUrl.startsWith('http')) {
            formattedUrl = 'https://www.google.com/search?q=' + encodeURIComponent(newUrl);
        }
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(formattedUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setFrameUrl(formattedUrl);
        setUrl(formattedUrl);
    };

    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setFrameUrl(history[newIndex]);
            setUrl(history[newIndex]);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setFrameUrl(history[newIndex]);
            setUrl(history[newIndex]);
        }
    };

    const goHome = () => {
        navigate(defaultUrl);
    };

    return (
        <div className="browser-shell" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="browser-header" style={{ background: '#ece9d8', padding: '5px', borderBottom: '1px solid #999' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px', padding: '0 5px' }}>
                    <button onClick={goBack} disabled={historyIndex === 0} style={{ padding: '2px 8px', background: '#ece9d8', border: '1px solid #999', opacity: historyIndex === 0 ? 0.5 : 1 }}><ArrowLeft size={16} /></button>
                    <button onClick={goForward} disabled={historyIndex === history.length - 1} style={{ padding: '2px 8px', background: '#ece9d8', border: '1px solid #999', opacity: historyIndex === history.length - 1 ? 0.5 : 1 }}><ArrowRight size={16} /></button>
                    <button onClick={goHome} style={{ padding: '2px 8px', background: '#ece9d8', border: '1px solid #999' }}><Home size={16} /></button>
                    <div style={{ flex: 1 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#245edb', textDecoration: 'none', marginRight: '10px' }}>
                            <ExternalLink size={14} /> Open in New Tab
                        </a>
                        <Shield size={14} color="#46ac46" /> Secure Mode
                    </div>
                </div>
                <div className="address-bar" style={{ display: 'flex', gap: '5px', padding: '2px 5px' }}>
                    <div style={{ background: 'white', border: '1px solid #7f9db9', flex: 1, display: 'flex', alignItems: 'center', padding: '2px 8px' }}>
                        <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && navigate(url)}
                            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px' }}
                        />
                        <RefreshCw size={14} style={{ cursor: 'pointer', color: '#666' }} onClick={() => setFrameUrl(url + '?t=' + Date.now())} />
                    </div>
                    <button onClick={() => navigate(url)} style={{ background: '#ece9d8', border: '1px solid #999', padding: '2px 10px', fontSize: '12px' }}>Go</button>
                </div>
            </div>
            <div className="browser-content" style={{ flex: 1, position: 'relative' }}>
                <iframe
                    src={frameUrl}
                    title="web"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-same-origin allow-scripts allow-forms"
                />
                {/* Warning Overlay for sites that block iframes */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', pointerEvents: 'none' }}>
                    Some sites may block embedding due to security (X-Frame-Options).
                </div>
            </div>
        </div>
    );
};

export default Browser;
