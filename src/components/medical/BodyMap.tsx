'use client';

import React, { useState } from 'react';
import { Activity, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Point {
    x: number;
    y: number;
    intensity: number;
    type: 'pain' | 'tension' | 'injury';
    label?: string;
}

interface BodyMapProps {
    points: Point[];
    onChange: (points: Point[]) => void;
    readOnly?: boolean;
}

export function BodyMap({ points, onChange, readOnly = false }: BodyMapProps) {
    const [activePoint, setActivePoint] = useState<number | null>(null);

    const handleAddPoint = (e: React.MouseEvent<SVGSVGElement>) => {
        if (readOnly) return;

        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        const newPoint: Point = {
            x: cursorPoint.x,
            y: cursorPoint.y,
            intensity: 5,
            type: 'pain'
        };

        onChange([...points, newPoint]);
        setActivePoint(points.length);
    };

    const updatePoint = (index: number, updates: Partial<Point>) => {
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], ...updates };
        onChange(newPoints);
    };

    const removePoint = (index: number) => {
        onChange(points.filter((_, i) => i !== index));
        setActivePoint(null);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2rem] border border-gray-100 dark:border-zinc-800 animate-fade-in">
            {/* SVG Area */}
            <div className="relative flex-1 aspect-[1/2] max-w-[300px] mx-auto bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-900 shadow-inner overflow-hidden cursor-crosshair">
                <svg
                    viewBox="0 0 200 400"
                    className="w-full h-full"
                    onClick={handleAddPoint}
                >
                    {/* Simplified Human Silhouette */}
                    <path
                        d="M100,20 C110,20 120,30 120,45 C120,60 110,70 100,70 C90,70 80,60 80,45 C80,30 90,20 100,20 Z 
                           M100,70 C130,75 150,90 155,120 L165,220 C168,240 160,250 150,245 L140,150 L135,380 C133,395 120,400 110,395 L100,340 L90,395 C80,400 67,395 65,380 L60,150 L50,245 C40,250 32,240 35,220 L45,120 C50,90 70,75 100,70 Z"
                        fill="currentColor"
                        className="text-gray-100 dark:text-zinc-900"
                    />

                    {/* Interaction Points */}
                    {points.map((pt, i) => (
                        <g
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setActivePoint(i); }}
                            className="cursor-pointer group"
                        >
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={8 + pt.intensity}
                                className={cn(
                                    "transition-all duration-300 opacity-60",
                                    pt.type === 'pain' ? "fill-red-500" : pt.type === 'tension' ? "fill-amber-500" : "fill-brand-500",
                                    activePoint === i && "opacity-100 scale-110 stroke-2 stroke-white shadow-glow"
                                )}
                            >
                                <animate attributeName="r" values={`${8 + pt.intensity};${12 + pt.intensity};${8 + pt.intensity}`} dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                className="fill-white"
                            />
                        </g>
                    ))}
                </svg>

                <div className="absolute top-4 left-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-800 shadow-sm pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">Map de Dolor</span>
                </div>
            </div>

            {/* Controls Area */}
            <div className="w-full md:w-64 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-brand-500" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Puntos Marcados ({points.length})</h4>
                </div>

                {activePoint !== null && points[activePoint] ? (
                    <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-950 border-2 border-brand-500 shadow-xl animate-scale-in space-y-4 relative">
                        <button
                            onClick={() => setActivePoint(null)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Malestar</label>
                            <div className="flex gap-2">
                                {['pain', 'tension', 'injury'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => updatePoint(activePoint!, { type: type as any })}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border",
                                            points[activePoint!].type === type
                                                ? (type === 'pain' ? "bg-red-500 border-red-500 text-white" : type === 'tension' ? "bg-amber-500 border-amber-500 text-white" : "bg-brand-500 border-brand-500 text-white")
                                                : "bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-400"
                                        )}
                                    >
                                        {type === 'pain' ? 'Dolor' : type === 'tension' ? 'Tensión' : 'Lesión'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                Intensidad
                                <span className="text-brand-600">{points[activePoint!].intensity}/10</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={points[activePoint!].intensity}
                                onChange={(e) => updatePoint(activePoint!, { intensity: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-gray-100 dark:bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nota Rápida</label>
                            <input
                                type="text"
                                value={points[activePoint!].label || ''}
                                onChange={(e) => updatePoint(activePoint!, { label: e.target.value })}
                                placeholder="Ej: Lumbar izquierda"
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={() => removePoint(activePoint!)}
                            className="w-full py-2 rounded-xl text-[9px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors uppercase tracking-widest"
                        >
                            Eliminar Punto
                        </button>
                    </div>
                ) : (
                    <div className="p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-400">
                            <Info className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                            Toque el cuerpo para marcar una zona de tratamiento
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BodyMap;
