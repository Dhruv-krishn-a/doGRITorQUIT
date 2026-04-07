//packages/notes-ui-web/src/components/InkOverlay.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import getStroke from 'perfect-freehand';

export type ToolType = 'pointer' | 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'text';

export interface Stroke {
  id: string;
  type: ToolType;
  points: number[][]; 
  start?: { x: number; y: number }; 
  end?: { x: number; y: number };   
  text?: string;
  color: string;
  size: number;
}

interface InkOverlayProps {
  isDrawingMode: boolean;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  tool?: ToolType;
  color?: string;
  size?: number;
}

function distanceToLineSegment(p: {x: number, y: number}, v: {x: number, y: number}, w: {x: number, y: number}) {
  const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function findStrokeNear(x: number, y: number, strokes: Stroke[]): Stroke | null {
  const hitRadius = 15;
  const p = {x, y};
  
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === 'pen' || stroke.type === 'highlighter') {
      for (let j = 0; j < stroke.points.length - 1; j++) {
        const p1 = {x: stroke.points[j][0], y: stroke.points[j][1]};
        const p2 = {x: stroke.points[j+1][0], y: stroke.points[j+1][1]};
        if (distanceToLineSegment(p, p1, p2) < hitRadius) {
          return stroke;
        }
      }
    } else if (stroke.type === 'text' && stroke.start) {
        if (x >= stroke.start.x - 10 && x <= stroke.start.x + 200 && y >= stroke.start.y - 30 && y <= stroke.start.y + 10) {
            return stroke;
        }
    } else if (stroke.start && stroke.end) {
      const minX = Math.min(stroke.start.x, stroke.end.x) - hitRadius;
      const maxX = Math.max(stroke.start.x, stroke.end.x) + hitRadius;
      const minY = Math.min(stroke.start.y, stroke.end.y) - hitRadius;
      const maxY = Math.max(stroke.start.y, stroke.end.y) + hitRadius;
      
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
         return stroke;
      }
    }
  }
  return null;
}

export function InkOverlay({ 
  isDrawingMode, 
  strokes, 
  onStrokesChange, 
  tool = 'pen',
  color = '#000000', 
  size = 4 
}: InkOverlayProps) {
  const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [endPoint, setEndPoint] = useState<{x: number, y: number} | null>(null);
  const [activeText, setActiveText] = useState<{x: number, y: number, text: string} | null>(null);
  
  const [draggingStroke, setDraggingStroke] = useState<{id: string, initialStrokes: Stroke[], startX: number, startY: number} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDrawingMode) return;
    
    // Don't intercept if we are clicking on the active text input
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    isPointerDownRef.current = true;

    // Commit existing active text if any
    if (activeText) {
      if (activeText.text.trim()) {
        onStrokesChange([...strokes, {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          type: 'text',
          points: [],
          start: {x: activeText.x, y: activeText.y},
          text: activeText.text,
          color,
          size
        }]);
      }
      setActiveText(null);
    }

    if (tool === 'text') {
      setActiveText({x, y, text: ''});
    } else if (tool === 'pointer') {
      const hit = findStrokeNear(x, y, strokes);
      if (hit) {
        setDraggingStroke({ id: hit.id, initialStrokes: JSON.parse(JSON.stringify(strokes)), startX: x, startY: y });
      }
    } else if (tool === 'eraser') {
      eraseStrokesNear(x, y);
    } else if (tool === 'pen' || tool === 'highlighter') {
      setCurrentPoints([[x, y, e.pressure || 0.5]]);
    } else {
      setStartPoint({x, y});
      setEndPoint({x, y});
    }
  }, [isDrawingMode, tool, strokes, activeText, color, size, onStrokesChange]);

  const eraseStrokesNear = (x: number, y: number) => {
    const hit = findStrokeNear(x, y, strokes);
    if (hit) {
       const newStrokes = strokes.filter(s => s.id !== hit.id);
       onStrokesChange(newStrokes);
    }
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingMode || !isPointerDownRef.current) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pointer' && draggingStroke) {
      const dx = x - draggingStroke.startX;
      const dy = y - draggingStroke.startY;
      
      const newStrokes = draggingStroke.initialStrokes.map(s => {
         if (s.id === draggingStroke.id) {
            if (s.type === 'pen' || s.type === 'highlighter') {
               return {
                 ...s,
                 points: s.points.map(pt => [pt[0] + dx, pt[1] + dy, pt[2]])
               };
            }
            if (s.type === 'text' && s.start) {
               return {
                 ...s,
                 start: { x: s.start.x + dx, y: s.start.y + dy }
               };
            }
            if (s.start && s.end) {
               return {
                 ...s,
                 start: { x: s.start.x + dx, y: s.start.y + dy },
                 end: { x: s.end.x + dx, y: s.end.y + dy }
               };
            }
         }
         return s;
      });
      onStrokesChange(newStrokes);
    } else if (tool === 'eraser') {
      eraseStrokesNear(x, y);
    } else if (tool === 'pen' || tool === 'highlighter') {
      setCurrentPoints(prev => [...prev, [x, y, e.pressure || 0.5]]);
    } else if (tool === 'rect' || tool === 'circle' || tool === 'arrow') {
      setEndPoint({x, y});
    }
  }, [isDrawingMode, currentPoints, tool, strokes, draggingStroke, onStrokesChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawingMode || !isPointerDownRef.current) return;
    e.preventDefault();
    isPointerDownRef.current = false;
    
    if (tool === 'pointer') {
      setDraggingStroke(null);
      return;
    }
    
    if (tool === 'eraser' || tool === 'text') {
      return;
    }

    if ((tool === 'pen' || tool === 'highlighter') && currentPoints.length > 0) {
      const newStroke: Stroke = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: tool,
        points: currentPoints,
        color,
        size,
      };
      onStrokesChange([...strokes, newStroke]);
      setCurrentPoints([]);
    } else if (startPoint && endPoint) {
      const newStroke: Stroke = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: tool,
        points: [],
        start: startPoint,
        end: endPoint,
        color,
        size,
      };
      onStrokesChange([...strokes, newStroke]);
      setStartPoint(null);
      setEndPoint(null);
    }
  }, [isDrawingMode, currentPoints, startPoint, endPoint, tool, strokes, color, size, onStrokesChange]);

  const getSvgPathFromStroke = (strokePoints: number[][], strokeSize: number, strokeType: ToolType) => {
    const isHighlighter = strokeType === 'highlighter';
    const stroke = getStroke(strokePoints, {
      size: strokeSize,
      thinning: isHighlighter ? -0.2 : 0.6,
      smoothing: isHighlighter ? 0.9 : 0.7,
      streamline: isHighlighter ? 0.8 : 0.6,
      simulatePressure: true,
    });
    if (!stroke.length) return "";
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ["M", ...stroke[0], "Q"]
    );
    d.push("Z");
    return d.join(" ");
  };

  const renderShape = (stroke: Stroke | {type: ToolType, start: {x:number, y:number}, end: {x:number, y:number}, color: string, size: number, text?: string}) => {
    if (stroke.type === 'text' && stroke.start && stroke.text) {
       return (
         <text 
           x={stroke.start.x} 
           y={stroke.start.y} 
           fill={stroke.color} 
           fontSize={Math.max(16, stroke.size * 5)} 
           fontFamily="sans-serif"
           style={{ whiteSpace: 'pre' }}
         >
           {stroke.text}
         </text>
       );
    }

    if (!stroke.start || !stroke.end) return null;
    const { start, end, color, size, type } = stroke;
    
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    if (type === 'rect') {
      return <rect x={minX} y={minY} width={width} height={height} fill="none" stroke={color} strokeWidth={size} rx={4} />;
    } else if (type === 'circle') {
      return <ellipse cx={minX + width/2} cy={minY + height/2} rx={width/2} ry={height/2} fill="none" stroke={color} strokeWidth={size} />;
    } else if (type === 'arrow') {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headlen = 10 + size;
      return (
        <g fill="none" stroke={color} strokeWidth={size} strokeLinecap="round" strokeLinejoin="round">
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
          <polyline points={`
            ${end.x - headlen * Math.cos(angle - Math.PI / 6)},${end.y - headlen * Math.sin(angle - Math.PI / 6)} 
            ${end.x},${end.y} 
            ${end.x - headlen * Math.cos(angle + Math.PI / 6)},${end.y - headlen * Math.sin(angle + Math.PI / 6)}
          `} />
        </g>
      );
    }
    return null;
  };

  const normalizedStrokes = strokes.map(s => {
     if (!s.type) return { ...s, type: 'pen' as ToolType };
     return s;
  });

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`absolute inset-0 z-40 touch-none ${isDrawingMode ? 'pointer-events-auto' : 'pointer-events-none'} ${tool === 'pointer' ? 'cursor-default' : tool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
    >
      <svg className="w-full h-full pointer-events-none">
        {normalizedStrokes.map(stroke => {
          if (stroke.type === 'pen' || stroke.type === 'highlighter') {
            return (
              <path
                key={stroke.id}
                d={getSvgPathFromStroke(stroke.points, stroke.size, stroke.type)}
                fill={stroke.type === 'highlighter' ? stroke.color : stroke.color}
                style={{
                  mixBlendMode: stroke.type === 'highlighter' ? 'multiply' : 'normal',
                  opacity: stroke.type === 'highlighter' ? 0.5 : 1
                }}
              />
            );
          } else {
            return <g key={stroke.id}>{renderShape(stroke)}</g>;
          }
        })}
        
        {/* Drawing Preview */}
        {currentPoints.length > 0 && (tool === 'pen' || tool === 'highlighter') && (
          <path
            d={getSvgPathFromStroke(currentPoints, size, tool)}
            fill={color}
            style={{
              mixBlendMode: tool === 'highlighter' ? 'multiply' : 'normal',
              opacity: tool === 'highlighter' ? 0.5 : 1
            }}
          />
        )}
        {startPoint && endPoint && (tool === 'rect' || tool === 'circle' || tool === 'arrow') && (
           <g>
             {renderShape({type: tool, start: startPoint, end: endPoint, color, size})}
           </g>
        )}
      </svg>

      {/* Active Text Input */}
      {activeText && (
        <textarea
          autoFocus
          value={activeText.text}
          onChange={e => setActiveText({...activeText, text: e.target.value})}
          placeholder="Type here..."
          className="absolute bg-transparent outline-none border border-indigo-500/50 rounded-sm pointer-events-auto p-0 m-0"
          style={{
            left: activeText.x,
            top: activeText.y - (Math.max(16, size * 5)), 
            color: color,
            fontSize: Math.max(16, size * 5),
            fontFamily: 'sans-serif',
            minWidth: '200px',
            minHeight: '40px',
            lineHeight: 1,
            resize: 'both'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              // Trigger a click outside to commit
              handlePointerDown({
                preventDefault: () => {},
                clientX: 0,
                clientY: 0,
                target: document.body
              } as any);
            }
          }}
        />
      )}
    </div>
  );
}