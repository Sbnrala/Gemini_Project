
import React, { useRef, useState, useEffect } from 'react';

interface WhiteboardProps {
  onClose: () => void;
  onSendToAI: (snapshot: string, prompt: string) => void;
  initialImage?: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ onClose, onSendToAI, initialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'line' | 'eraser' | 'text'>('pencil');
  const [prompt, setPrompt] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas size
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const tempImage = canvas.toDataURL();
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Re-draw grid
        drawGrid(ctx, canvas.width, canvas.height);
        
        // If we have an initial image, load it
        if (initialImage) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = initialImage;
        } else {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = tempImage;
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [initialImage]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    const step = 20;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    setStartPos({ x, y });
    setIsDrawing(true);

    if (tool === 'pencil' || tool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    } else if (tool === 'text') {
      const text = window.prompt("Enter dimension or text:");
      if (text) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.font = 'bold 14px Inter';
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
        }
      }
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (tool === 'line') {
      const { x, y } = getCoordinates(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Add dimension lines
        const dist = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)).toFixed(0);
        ctx.font = '10px Inter';
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`${dist}mm`, (startPos.x + x) / 2 + 5, (startPos.y + y) / 2 - 5);
      }
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex flex-col p-4 md:p-8">
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl border border-slate-700">
        <header className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
               <span className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></span>
               Design Workbench
            </h3>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
               <button onClick={() => setTool('pencil')} className={`p-2 rounded-lg ${tool === 'pencil' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} title="Pencil">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               </button>
               <button onClick={() => setTool('line')} className={`p-2 rounded-lg ${tool === 'line' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} title="Line & Dimension">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" /></svg>
               </button>
               <button onClick={() => setTool('text')} className={`p-2 rounded-lg ${tool === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} title="Text Label">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </button>
               <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} title="Eraser">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0" />
            <button onClick={clearCanvas} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Clear Board</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 font-bold text-sm">Cancel</button>
          </div>
        </header>

        <div className="flex-1 relative cursor-crosshair overflow-hidden bg-white">
          <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block"
          />
        </div>

        <footer className="bg-slate-50 border-t border-slate-200 p-6 flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI about this design (e.g., 'Is this structural plan viable?')"
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-inner focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button 
            disabled={!prompt}
            onClick={() => onSendToAI(canvasRef.current?.toDataURL() || '', prompt)}
            className="bg-indigo-600 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            Consult AI
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </footer>
      </div>
    </div>
  );
};
