import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, HardDrive, Wifi, ShieldCheck, Database, Globe,
  FileText, Folder, Trash, X, Minus, Square, Search,
  ArrowLeft, ArrowRight, RefreshCw, Home, Power,
  Monitor, Settings, User, Clock, Sun, Info, ExternalLink,
  Music, Image as ImageIcon, Mail, Calculator as CalcIcon, Palette, AlertCircle,
  Menu, ChevronLeft, CheckCircle, StickyNote, Bomb, Layout, FolderPlus, FilePlus, Trash2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// App IDs
const APP_TASK_MANAGER = 'task-manager';
const APP_EXPLORER = 'explorer';
const APP_BROWSER = 'browser';
const APP_NOTEPAD = 'notepad';
const APP_RESUME = 'resume-viewer';
const APP_PAINT = 'paint';
const APP_CALC = 'calculator';
const APP_DISPLAY = 'display-properties';
const APP_MINESWEEPER = 'minesweeper';
const APP_SOLITAIRE = 'solitaire';
const APP_TODO = 'todo';
const APP_NOTES = 'notes';

import Minesweeper from './apps/Minesweeper';
import Solitaire from './apps/Solitaire';
import PaintApp from './apps/PaintApp';
import TodoApp from './apps/TodoApp';
import NotesApp from './apps/NotesApp';
import Browser from './apps/Browser';
import NotepadApp from './apps/Notepad';
import { getFileSystem, saveFileSystem, findNodeById, updateNodeInTree, addNodeToParent, deleteNode, moveToTrash, emptyTrash } from './FileSystem';

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540',
  'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=3540',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=3540'
];

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return isMobile;
};

const App = () => {
  const isMobile = useMobile();
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [bsod, setBsod] = useState(false);
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [clippyVisible, setClippyVisible] = useState(true);
  const [clippyMsg, setClippyMsg] = useState("It looks like you're trying to view a resume. Would you like some help?");
  const [trayOpen, setTrayOpen] = useState(false);
  const [fs, setFs] = useState(getFileSystem());
  const [currentFolderId, setCurrentFolderId] = useState('c-drive');
  const [openFile, setOpenFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, options: [] });
  const recycleBinRef = useRef(null);

  const [stats, setStats] = useState({
    cpu: { load: 0, temp: 42 },
    memory: { used: 0, total: navigator.deviceMemory || 8 },
    storage: [{ fs: 'C:', use: 42, size: 512, used: 215 }]
  });
  const [history, setHistory] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const bootTimer = setTimeout(() => setBooting(false), 4500);
    const interval = setInterval(() => {
      setTime(new Date());
      setStats(prev => {
        const newCpu = Math.max(5, Math.min(95, prev.cpu.load + (Math.random() - 0.5) * 15));
        const newMem = Math.max(20, Math.min(85, prev.memory.used + (Math.random() - 0.5) * 8));
        const currentStats = { ...prev, cpu: { load: Math.round(newCpu), temp: 40 + Math.round(Math.random() * 8) }, memory: { used: Math.round(newMem) } };
        setHistory(h => {
          const next = [...h, { time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' }), cpu: currentStats.cpu.load, memory: currentStats.memory.used }];
          return next.slice(-30);
        });
        return currentStats;
      });
    }, 1000);

    const clippyTimer = setInterval(() => {
      const msgs = ["Tap things twice to open them!", "Check out the Performance tab.", "Don't open System32.exe!", "You can change wallpapers in Display."];
      setClippyMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 15000);

    return () => { clearTimeout(bootTimer); clearInterval(interval); clearInterval(clippyTimer); };
  }, []);

  const openApp = (appId, title, params = {}) => {
    setStartMenuOpen(false);
    if (appId === APP_NOTEPAD && params.file) {
      setOpenFile(params.file);
    }

    if (windows.find(w => w.id === appId)) {
      setActiveWindow(appId);
      setWindows(prev => prev.map(w => w.id === appId ? { ...w, minimized: false, zIndex: Math.max(0, ...prev.map(win => win.zIndex)) + 1 } : w));
      return;
    }
    const newWindow = {
      id: appId,
      title,
      zIndex: windows.length + 10,
      minimized: false,
      position: isMobile ? { x: 0, y: 0 } : { x: 100 + windows.length * 40, y: 80 + windows.length * 40 },
      params
    };
    setWindows([...windows, newWindow]);
    setActiveWindow(appId);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const toggleMinimize = (id) => {
    if (isMobile) {
      // Switch between windows if they exist
      setActiveWindow(id);
    } else {
      setWindows(windows.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
    }
  };

  const focusWindow = (id) => {
    setActiveWindow(id);
    setWindows(prev => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  };

  const showContextMenu = (e, options) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, options });
  };

  const handleDragIconEnd = (e, info, nodeId, nodeName) => {
    if (!recycleBinRef.current) return;
    const binRect = recycleBinRef.current.getBoundingClientRect();
    const { x, y } = info.point;

    if (x >= binRect.left && x <= binRect.right && y >= binRect.top && y <= binRect.bottom) {
      if (nodeId && confirm(`Move ${nodeName} to Recycle Bin?`)) {
        setFs(moveToTrash(fs, nodeId));
      }
    }
  };

  useEffect(() => {
    const handle = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handle);
    return () => window.removeEventListener('click', handle);
  }, []);

  const refreshFs = () => setFs(getFileSystem());

  const desktopOptions = [
    { label: 'Arrange Icons By', action: () => { } },
    { label: 'Refresh', action: refreshFs },
    { type: 'sep' },
    {
      label: 'New Folder', action: () => {
        const name = prompt('New Folder Name:');
        if (name) setFs(addNodeToParent(fs, 'desktop', { id: 'folder-' + Date.now(), name, type: 'folder', children: [] }));
      }
    },
    {
      label: 'New Text Document', action: () => {
        const name = prompt('New File Name:');
        if (name) setFs(addNodeToParent(fs, 'desktop', { id: 'file-' + Date.now(), name, type: 'file', content: '' }));
      }
    },
    { type: 'sep' },
    { label: 'Properties', action: () => openApp(APP_DISPLAY, 'Display Properties') }
  ];

  const iconMenu = (id, action) => [
    { label: 'Open', action, bold: true },
    { label: 'Pin to Start Menu', action: () => { } },
    { type: 'sep' },
    { label: 'Send To', action: () => { } },
    { type: 'sep' },
    { label: 'Delete', action: () => { if (id && confirm('Move to Recycle Bin?')) setFs(moveToTrash(fs, id)); } },
    { label: 'Rename', action: () => { } },
    { type: 'sep' },
    { label: 'Properties', action: () => { } }
  ];

  const triggerBsod = () => {
    setBsod(true);
    setTimeout(() => window.location.reload(), 6000);
  };

  if (bsod) return (
    <div className="bsod-screen">
      <div className="bsod-header">WINDOWS</div>
      <p style={{ marginTop: '20px' }}>A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
      <p>DRV_FAULT_SYSTEM32_EXE</p>
      <p>*** STOP: 0x00000050 (0xFD3094C2, 0x00000001, 0xFBFE7617, 0x00000000)</p>
      <p style={{ marginTop: '40px' }}>Beginning dump of physical memory... _</p>
    </div>
  );

  if (booting) return (
    <div className="xp-boot-wrapper">
      <div className="xp-logo">
        <div className="ms-text">Microsoft</div>
        <div className="main-logo" style={{ fontSize: isMobile ? '40px' : '56px' }}>Windows<span>XP</span></div>
      </div>
      <div className="boot-loader" style={{ width: isMobile ? '140px' : '180px' }}>
        <div className="loader-chunks"><div className="l-chunk"></div><div className="l-chunk"></div><div className="l-chunk"></div></div>
      </div>
      <div className="copyright">Copyright © Microsoft Corporation</div>
    </div>
  );

  return (
    <div className={`xp-container ${isMobile ? 'mobile' : ''}`}>
      <div
        className="desktop"
        onClick={() => { setActiveWindow(null); setStartMenuOpen(false); setTrayOpen(false); }}
        onContextMenu={(e) => showContextMenu(e, desktopOptions)}
        style={{ backgroundImage: `url(${wallpaper})` }}
      >
        <DesktopIcon icon={<FileText size={isMobile ? 48 : 40} color="#0058e6" />} label="Resume.pdf" onDoubleClick={() => openApp(APP_RESUME, 'Resume Viewer')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_RESUME, 'Resume Viewer')))} />
        <DesktopIcon icon={<HardDrive size={isMobile ? 42 : 34} color="#0058e6" />} label="My Computer" onDoubleClick={() => { setCurrentFolderId('c-drive'); openApp(APP_EXPLORER, 'My Computer'); }} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => { setCurrentFolderId('c-drive'); openApp(APP_EXPLORER, 'My Computer'); }))} />
        <DesktopIcon icon={<Monitor size={isMobile ? 42 : 34} color="#46ac46" />} label="Task Manager" onDoubleClick={() => openApp(APP_TASK_MANAGER, 'Task Manager')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_TASK_MANAGER, 'Task Manager')))} />
        <DesktopIcon icon={<Palette size={isMobile ? 42 : 34} color="#ff8a00" />} label="Paint" onDoubleClick={() => openApp(APP_PAINT, 'Paint')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_PAINT, 'Paint')))} />
        <DesktopIcon icon={<CalcIcon size={isMobile ? 42 : 34} color="#94a3b8" />} label="Calculator" onDoubleClick={() => openApp(APP_CALC, 'Calculator')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_CALC, 'Calculator')))} />
        <DesktopIcon icon={<Globe size={isMobile ? 42 : 34} color="#ff8a00" />} label="Web Browser" onDoubleClick={() => openApp(APP_BROWSER, 'Internet Explorer')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_BROWSER, 'Internet Explorer')))} />
        <DesktopIcon icon={<Settings size={isMobile ? 42 : 34} color="#6366f1" />} label="Display" onDoubleClick={() => openApp(APP_DISPLAY, 'Display Properties')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_DISPLAY, 'Display Properties')))} />
        <DesktopIcon icon={<CheckCircle size={isMobile ? 42 : 34} color="#46ac46" />} label="Tasks" onDoubleClick={() => openApp(APP_TODO, 'Todo List')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_TODO, 'Todo List')))} />
        <DesktopIcon icon={<StickyNote size={isMobile ? 42 : 34} color="#fbbf24" />} label="Notes" onDoubleClick={() => openApp(APP_NOTES, 'Digital Notebook')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_NOTES, 'Digital Notebook')))} />
        <DesktopIcon icon={<Bomb size={isMobile ? 42 : 34} color="#ef4444" />} label="Minesweeper" onDoubleClick={() => openApp(APP_MINESWEEPER, 'Minesweeper')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_MINESWEEPER, 'Minesweeper')))} />
        <DesktopIcon icon={<Layout size={isMobile ? 38 : 34} color="#245edb" />} label="Solitaire" onDoubleClick={() => openApp(APP_SOLITAIRE, 'Solitaire')} onContextMenu={(e) => showContextMenu(e, iconMenu(null, () => openApp(APP_SOLITAIRE, 'Solitaire')))} />
        <DesktopIcon
          icon={findNodeById(fs.children, 'recycle-bin')?.children?.length > 0 ? <Trash size={isMobile ? 42 : 34} color="#0058e6" /> : <Trash2 size={isMobile ? 42 : 34} color="#0058e6" />}
          label="Recycle Bin"
          onDoubleClick={() => { setCurrentFolderId('recycle-bin'); openApp(APP_EXPLORER, 'Recycle Bin'); }}
          innerRef={recycleBinRef}
          onContextMenu={(e) => showContextMenu(e, [
            { label: 'Open', action: () => { setCurrentFolderId('recycle-bin'); openApp(APP_EXPLORER, 'Recycle Bin'); }, bold: true },
            { label: 'Empty Recycle Bin', action: () => { if (confirm('Are you sure you want to empty the Recycle Bin?')) setFs(emptyTrash(fs)); } },
            { type: 'sep' },
            { label: 'Properties', action: () => { } }
          ])}
        />

        {findNodeById(fs.children, 'desktop')?.children?.map(node => (
          <DesktopIcon
            key={node.id}
            label={node.name}
            onDragEnd={(e, info) => handleDragIconEnd(e, info, node.id, node.name)}
            icon={node.type === 'folder' ? <Folder size={isMobile ? 42 : 34} color="#ffcc00" /> : <FileText size={isMobile ? 42 : 34} color="#94a3b8" />}
            onDoubleClick={() => {
              if (node.type === 'folder') {
                setCurrentFolderId(node.id);
                openApp(APP_EXPLORER, node.name);
              } else if (node.type === 'file') {
                openApp(APP_NOTEPAD, 'Notepad', { file: node });
              }
            }}
            onContextMenu={(e) => {
              const options = [
                {
                  label: 'Open', action: () => {
                    if (node.type === 'folder') {
                      setCurrentFolderId(node.id);
                      openApp(APP_EXPLORER, node.name);
                    } else {
                      openApp(APP_NOTEPAD, 'Notepad', { file: node });
                    }
                  }, bold: true
                },
                {
                  label: 'Delete', action: () => {
                    if (confirm(`Are you sure you want to move ${node.name} to the Recycle Bin?`)) {
                      setFs(moveToTrash(fs, node.id));
                    }
                  }
                },
                {
                  label: 'Rename', action: () => {
                    const name = prompt('Rename to:', node.name);
                    if (name) {
                      setFs({ ...fs, children: updateNodeInTree(fs.children, node.id, (n) => ({ ...n, name })) });
                    }
                  }
                },
                { type: 'sep' },
                { label: 'Properties', action: () => alert(`Name: ${node.name}\nType: ${node.type}`) }
              ];
              showContextMenu(e, options);
            }}
          />
        ))}

        <AnimatePresence>
          {windows.map(win => (isMobile ? activeWindow === win.id : !win.minimized) && (
            <Window key={win.id} window={win} isMobile={isMobile} isActive={activeWindow === win.id} onClose={() => closeWindow(win.id)} onMinimize={() => toggleMinimize(win.id)} onFocus={() => focusWindow(win.id)}>
              {win.id === APP_RESUME && <ResumeViewer isMobile={isMobile} />}
              {win.id === APP_TASK_MANAGER && <TaskManager stats={stats} history={history} isMobile={isMobile} />}
              {win.id === APP_EXPLORER && <FileExplorer triggerBsod={triggerBsod} isMobile={isMobile} fs={fs} setFs={setFs} currentFolderId={currentFolderId} setCurrentFolderId={setCurrentFolderId} openApp={openApp} showContextMenu={showContextMenu} />}
              {win.id === APP_BROWSER && <Browser isMobile={isMobile} />}
              {win.id === APP_PAINT && <PaintApp isMobile={isMobile} />}
              {win.id === APP_CALC && <Calculator isMobile={isMobile} />}
              {win.id === APP_DISPLAY && <DisplayProps setWallpaper={setWallpaper} wallpaper={wallpaper} isMobile={isMobile} />}
              {win.id === APP_NOTEPAD && <NotepadApp initialFile={openFile} onSave={(file) => {
                const updatedFs = { ...fs, children: updateNodeInTree(fs.children, file.id || 'documents', node => ({ ...node, ...file })) };
                setFs(updatedFs);
                saveFileSystem(updatedFs);
                setOpenFile(file);
              }} isMobile={isMobile} />}
              {win.id === APP_TODO && <TodoApp isMobile={isMobile} />}
              {win.id === APP_NOTES && <NotesApp isMobile={isMobile} />}
              {win.id === APP_MINESWEEPER && <Minesweeper isMobile={isMobile} />}
              {win.id === APP_SOLITAIRE && <Solitaire isMobile={isMobile} />}
            </Window>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {(trayOpen || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: 200 } : { opacity: 0 }}
              animate={isMobile ? { x: 0 } : { opacity: 1 }}
              exit={isMobile ? { x: 200 } : { opacity: 0 }}
              className="widgets-tray"
            >
              <div className="xp-widget">
                <div className="widget-title">Weather</div>
                <div className="widget-body"><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><Sun size={32} color="#fbbf24" /><div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>28°C</div><div style={{ fontSize: '10px', opacity: 0.8 }}>Sunny</div></div></div></div>
              </div>
              <div className="xp-widget">
                <div className="widget-title">CPU Pulse</div>
                <div className="widget-body"><div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '40px' }}><div style={{ width: '40px', background: stats.cpu.load > 80 ? '#ef4444' : '#10b981', height: `${stats.cpu.load}%`, transition: 'height 0.3s' }}></div><div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.cpu.load}%</div></div></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {clippyVisible && !isMobile && (
          <div className="clippy-container">
            <div className="clippy-bubble">{clippyMsg}</div>
            <div className="clippy-avatar" onClick={() => setClippyVisible(false)}>
              <Info size={24} color="#000" />
            </div>
          </div>
        )}
      </div>

      <div className="xp-taskbar">
        <div className={`start-btn ${startMenuOpen ? 'pressed' : ''}`} onClick={(e) => { e.stopPropagation(); setStartMenuOpen(!startMenuOpen); }}>
          <div className="start-btn-icon"><div className="c1" style={{ background: '#ee3124' }}></div><div className="c2" style={{ background: '#00a651' }}></div><div className="c3" style={{ background: '#00aeef' }}></div><div className="c4" style={{ background: '#fff200' }}></div></div>
          {isMobile ? '' : 'start'}
        </div>
        <div className="taskbar-instances">
          {isMobile && activeWindow && (
            <div className="task-instance active mobile-back" onClick={() => setActiveWindow(null)}>
              <ChevronLeft size={16} /> Back
            </div>
          )}
          {!isMobile && windows.map(win => <div key={win.id} className={`task-instance ${activeWindow === win.id ? 'active' : ''}`} onClick={() => toggleMinimize(win.id)}><span>{win.title}</span></div>)}
        </div>
        <div className="taskbar-tray" onClick={(e) => { e.stopPropagation(); isMobile && setTrayOpen(!trayOpen); }}>
          <Wifi size={14} color="white" />
          <div className="tray-clock">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <AnimatePresence>
        {startMenuOpen && (
          <motion.div className="start-menu"
            initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            style={{ width: isMobile ? '100%' : '380px', left: 0, right: 0 }}
          >
            <div className="start-menu-header"><div className="user-avatar" style={{ background: '#245edb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} color="white" /></div><span>Administrator</span></div>
            <div className="start-menu-body" style={{ gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr' }}>
              <div className="menu-left">
                <MenuItem icon={<Globe size={18} color="#245edb" />} label="Internet Explorer" onClick={() => openApp(APP_BROWSER, 'Internet Explorer')} />
                <MenuItem icon={<CalcIcon size={18} color="#245edb" />} label="Calculator" onClick={() => openApp(APP_CALC, 'Calculator')} />
                <MenuItem icon={<Palette size={18} color="#245edb" />} label="Paint" onClick={() => openApp(APP_PAINT, 'Paint')} />
                <MenuItem icon={<Monitor size={18} color="#245edb" />} label="Task Manager" onClick={() => openApp(APP_TASK_MANAGER, 'Task Manager')} />
                <MenuItem icon={<CheckCircle size={18} color="#245edb" />} label="Todo List" onClick={() => openApp(APP_TODO, 'Todo List')} />
                <MenuItem icon={<StickyNote size={18} color="#245edb" />} label="Notes" onClick={() => openApp(APP_NOTES, 'Digital Notebook')} />
                <MenuItem icon={<Bomb size={18} color="#245edb" />} label="Minesweeper" onClick={() => openApp(APP_MINESWEEPER, 'Minesweeper')} />
                <MenuItem icon={<Layout size={18} color="#245edb" />} label="Solitaire" onClick={() => openApp(APP_SOLITAIRE, 'Solitaire')} />
              </div>
              {!isMobile && (
                <div className="menu-right">
                  <MenuItem label="My Computer" bold onClick={() => openApp(APP_EXPLORER, 'My Computer')} />
                  <MenuItem label="Display Properties" onClick={() => openApp(APP_DISPLAY, 'Display Properties')} />
                </div>
              )}
            </div>
            <div className="start-menu-footer"><div className="footer-btn" onClick={() => window.location.reload()}><Power size={18} /> Log Off</div><div className="footer-btn" onClick={() => triggerBsod()}><Power size={18} /> Shutdown</div></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.options.map((opt, i) => (
              opt.type === 'sep' ? <div key={i} className="context-menu-sep" /> :
                <div key={i} className="context-menu-item" onClick={opt.action}>{opt.label}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Components ---

const DesktopIcon = ({ icon, label, onDoubleClick, onContextMenu, innerRef, isDraggable = true, onDragEnd }) => (
  <motion.div
    ref={innerRef}
    drag={isDraggable}
    dragMomentum={false}
    onDragEnd={onDragEnd}
    className="desktop-icon"
    onDoubleClick={onDoubleClick}
    onContextMenu={onContextMenu}
  >
    <div className="icon-wrapper">{icon}</div>
    <span>{label}</span>
  </motion.div>
);

const Window = ({ window, children, onClose, onMinimize, isActive, onFocus, isMobile }) => (
  <motion.div drag={!isMobile} dragMomentum={false} onPointerDown={onFocus} className={`xp-window ${!isActive ? 'inactive' : ''} ${isMobile ? 'mobile-max' : ''}`}
    style={{
      zIndex: window.zIndex,
      left: isMobile ? 0 : window.position.x,
      top: isMobile ? 0 : window.position.y,
      width: isMobile ? '100%' : (
        window.id === APP_CALC ? 320 :
          window.id === APP_PAINT ? 800 :
            window.id === APP_DISPLAY ? 480 :
              window.id === APP_MINESWEEPER ? 250 :
                window.id === APP_TODO ? 400 :
                  window.id === APP_NOTES ? 700 :
                    960
      ),
      height: isMobile ? '100%' : (
        window.id === APP_CALC ? 400 :
          window.id === APP_PAINT ? 620 :
            window.id === APP_DISPLAY ? 520 :
              window.id === APP_MINESWEEPER ? 350 :
                window.id === APP_TODO ? 500 :
                  window.id === APP_NOTES ? 500 :
                    680
      )
    }}>
    <div className="window-bar"><span>{window.title}</span><div className="window-actions">{!isMobile && <div className="win-btn" onClick={onMinimize}><Minus size={14} color="white" /></div>}<div className="win-btn win-btn-close" onClick={onClose}><X size={14} color="white" /></div></div></div>
    <div className="win-inner">{children}</div>
  </motion.div>
);

const MenuItem = ({ icon, label, bold, onClick }) => (
  <div className="menu-item" onClick={onClick}>
    {icon && <div className="menu-item-icon">{icon}</div>}
    <div className="menu-item-content"><span style={{ fontWeight: bold ? 'bold' : 'normal', fontSize: '13px' }}>{label}</span></div>
  </div>
);

// --- App Screens ---

const ResumeViewer = () => (
  <div className="browser-shell">
    <div className="browser-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Resume.pdf</span>
      <div style={{ display: 'flex', gap: '15px' }}>
        <a href="/resume.pdf" download style={{ fontSize: '10px', color: '#245edb', textDecoration: 'none' }}><HardDrive size={12} /> Save</a>
      </div>
    </div>
    <div className="browser-content">
      <iframe src="/resume.pdf" title="Resume" />
    </div>
  </div>
);

const Calculator = () => {
  const [val, setVal] = useState('0');
  const btns = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];
  const handle = (b) => {
    if (b === 'C') setVal('0');
    else if (b === '=') { try { setVal(eval(val).toString()); } catch { setVal('Error'); } }
    else setVal(val === '0' ? b : val + b);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', padding: '15px', background: '#ece9d8', height: '100%', width: '100%' }}>
      <div style={{ gridColumn: 'span 4', background: 'white', border: '1px solid #7f9db9', padding: '10px', textAlign: 'right', fontSize: '24px', fontFamily: 'monospace', marginBottom: '10px' }}>{val}</div>
      {btns.map(b => <div key={b} className="calc-btn" style={{ padding: '12px', background: '#f0f0f0', border: '1px solid #999', cursor: 'pointer', textAlign: 'center', boxShadow: '1px 1px 1px white inset' }} onClick={() => handle(b)}>{b}</div>)}
    </div>
  );
};



const TaskManager = ({ stats, history, isMobile }) => (
  <div className="tm-container">
    <div className="tm-tabs">
      <div className="tm-tab active">Performance</div>
      {!isMobile && <div className="tm-tab">Processes</div>}
    </div>
    <div className="tm-content" style={{ gridTemplateColumns: isMobile ? '1fr' : '130px 1fr' }}>
      {!isMobile && (
        <div className="tm-stats-left">
          <div className="tm-gauge-card"><span className="tm-gauge-label">CPU Usage</span><div className="tm-gauge-box"><div className="tm-gauge-fill" style={{ height: `${stats.cpu.load}%`, background: '#00ff00' }}></div></div><span style={{ fontSize: '18px', marginTop: '5px' }}>{stats.cpu.load}%</span></div>
          <div className="tm-gauge-card"><span className="tm-gauge-label">MEM Usage</span><div className="tm-gauge-box"><div className="tm-gauge-fill" style={{ height: `${stats.memory.used}%`, background: '#ffff00' }}></div></div><span style={{ fontSize: '18px', marginTop: '5px' }}>{stats.memory.used}%</span></div>
        </div>
      )}
      <div className="tm-graph-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="#113311" vertical={false} />
            <Area type="stepAfter" dataKey="cpu" stroke="#00ff00" fill="#003300" isAnimationActive={false} />
            <Area type="stepAfter" dataKey="memory" stroke="#ffff00" fill="#333300" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {isMobile && <div style={{ background: '#000', color: '#0f0', padding: '10px', fontSize: '14px', fontFamily: 'monospace' }}>CPU: {stats.cpu.load}% | MEM: {stats.memory.used}%</div>}
    </div>
  </div>
);

const FileExplorer = ({ triggerBsod, isMobile, fs, setFs, currentFolderId, setCurrentFolderId, openApp, showContextMenu }) => {
  const currentFolder = findNodeById(fs.children, currentFolderId) || fs.children[0];

  const handleDoubleClick = (node) => {
    if (node.type === 'folder' || node.type === 'drive') {
      setCurrentFolderId(node.id);
    } else if (node.type === 'file') {
      if (node.name.endsWith('.txt') || node.id === 'readme') {
        openApp(APP_NOTEPAD, 'Notepad', { file: node });
      }
    }
  };

  const createFolder = () => {
    const name = prompt('Enter folder name:', 'New Folder');
    if (name) {
      const newNode = { id: 'folder-' + Date.now(), name, type: 'folder', children: [] };
      setFs(addNodeToParent(fs, currentFolderId, newNode));
    }
  };

  const createFile = () => {
    const name = prompt('Enter file name:', 'New Text Document.txt');
    if (name) {
      const newNode = { id: 'file-' + Date.now(), name, type: 'file', content: '' };
      setFs(addNodeToParent(fs, currentFolderId, newNode));
    }
  };

  const explorerOptions = [
    { label: 'View', action: () => { } },
    { label: 'Refresh', action: () => setFs(getFileSystem()) },
    { type: 'sep' },
    currentFolderId === 'recycle-bin' ?
      { label: 'Empty Recycle Bin', action: () => { if (confirm('Empty all items?')) setFs(emptyTrash(fs)); } } :
      { label: 'New Folder', action: createFolder },
    currentFolderId !== 'recycle-bin' && { label: 'New Text Document', action: createFile },
    { type: 'sep' },
    { label: 'Properties', action: () => { } }
  ].filter(Boolean);

  const getItemOptions = (node) => [
    { label: 'Open', action: () => handleDoubleClick(node) },
    { label: 'Explore', action: () => handleDoubleClick(node) },
    { type: 'sep' },
    {
      label: 'Delete', action: () => {
        if (confirm(`Are you sure you want to move ${node.name} to the Recycle Bin?`)) {
          setFs(moveToTrash(fs, node.id));
        }
      }
    },
    {
      label: 'Rename', action: () => {
        const name = prompt('Rename to:', node.name);
        if (name) {
          setFs({ ...fs, children: updateNodeInTree(fs.children, node.id, (n) => ({ ...n, name })) });
        }
      }
    },
    { type: 'sep' },
    { label: 'Properties', action: () => alert(`Name: ${node.name}\nType: ${node.type}`) }
  ];

  return (
    <div className="explorer-layout">
      {!isMobile && (
        <div className="explorer-side">
          <div className="side-card">
            <div className="side-title">File Tasks</div>
            <div className="side-link" onClick={createFolder}><FolderPlus size={12} /> Create Folder</div>
            <div className="side-link" onClick={createFile}><FilePlus size={12} /> Create Text File</div>
          </div>
          <div className="side-card">
            <div className="side-title">Other Places</div>
            <div className="side-link" onClick={() => setCurrentFolderId('c-drive')}>My Computer</div>
            <div className="side-link" onClick={() => setCurrentFolderId('desktop')}>Desktop</div>
          </div>
        </div>
      )}
      <div className="explorer-main">
        <div className="explorer-nav">
          <ArrowLeft size={14} style={{ cursor: 'pointer' }} onClick={() => setCurrentFolderId('c-drive')} title="Back to My Computer" />
          <div style={{ marginLeft: '10px', fontSize: '11px', flex: 1, background: 'white', border: '1px solid #7f9db9', padding: '2px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Address: C:\{currentFolderId === 'c-drive' ? '' : currentFolder?.name}
          </div>
          <RefreshCw size={14} style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={() => setFs(getFileSystem())} />
        </div>
        <div
          className="explorer-view"
          onContextMenu={(e) => showContextMenu(e, explorerOptions)}
          style={{ gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(60px, 1fr))' : 'repeat(auto-fill, minmax(80px, 1fr))' }}
        >
          {currentFolder?.children?.map(node => (
            <div
              key={node.id}
              className="explorer-item"
              onDoubleClick={() => handleDoubleClick(node)}
              onClick={() => isMobile && handleDoubleClick(node)}
              onContextMenu={(e) => {
                e.stopPropagation();
                showContextMenu(e, getItemOptions(node));
              }}
            >
              {node.type === 'folder' && <Folder size={40} color="#ffcc00" />}
              {node.type === 'drive' && <HardDrive size={40} color="#0058e6" />}
              {node.type === 'file' && <FileText size={40} color="#94a3b8" />}
              <span>{node.name}</span>
            </div>
          ))}
          {currentFolderId === 'system32' && <div className="explorer-item" onClick={triggerBsod}><AlertCircle size={40} color="#ef4444" /><span>System32</span></div>}
        </div>
      </div>
    </div>
  );
};

const DisplayProps = ({ setWallpaper, wallpaper, isMobile }) => (
  <div style={{ padding: isMobile ? '10px' : '20px', background: '#ece9d8', height: '100%', width: '100%' }}>
    <div style={{ background: '#fff', border: '1px solid #999', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><ImageIcon size={40} color="#3b82f6" /><div><strong>Wallpapers</strong></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {WALLPAPERS.map((wp, i) => (
          <div key={i} onClick={() => setWallpaper(wp)} style={{ cursor: 'pointer', border: wallpaper === wp ? '3px solid #245edb' : '1px solid #ccc', height: '60px', backgroundImage: `url(${wp})`, backgroundSize: 'cover', borderRadius: '4px' }} />
        ))}
      </div>
    </div>
  </div>
);

export default App;
