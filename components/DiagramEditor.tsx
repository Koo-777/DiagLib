'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Diagram } from '@/types';
import { toPng, toSvg } from 'html-to-image';
import { Download, Copy, Share2, RefreshCw, Palette } from 'lucide-react';

interface DiagramEditorProps {
    diagram: Diagram;
    initialSvgContent: string;
}

export function DiagramEditor({ diagram, initialSvgContent }: DiagramEditorProps) {
    const [svgContent, setSvgContent] = useState(initialSvgContent);
    const [originalColors, setOriginalColors] = useState<string[]>([]);
    const [colorMap, setColorMap] = useState<Record<string, string>>({});
    const previewRef = useRef<HTMLDivElement>(null);

    // Extract colors from SVG on load
    useEffect(() => {
        // Regex to find hex colors. 
        // Extend to RGB/RGBA if needed, but hex is standard for these assets.
        const hexRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g;
        const matches = initialSvgContent.match(hexRegex);
        if (matches) {
            const uniqueColors = Array.from(new Set(matches));
            setOriginalColors(uniqueColors);
            const initialMap: Record<string, string> = {};
            uniqueColors.forEach(c => initialMap[c] = c);
            setColorMap(initialMap);
        }
    }, [initialSvgContent]);

    // Update SVG content when colorMap changes
    useEffect(() => {
        let newContent = initialSvgContent;
        Object.entries(colorMap).forEach(([original, current]) => {
            // Global replace of the color
            // Escape the original color string for regex if needed, but hex is safe
            const regex = new RegExp(original, 'g');
            newContent = newContent.replace(regex, current);
        });
        setSvgContent(newContent);
    }, [colorMap, initialSvgContent]);

    const handleColorChange = (original: string, newColor: string) => {
        setColorMap(prev => ({ ...prev, [original]: newColor }));
    };

    const handleDownload = async (format: 'png' | 'svg') => {
        if (!previewRef.current) return;

        // The node we want to capture is the inner SVG container
        // But html-to-image works on DOM nodes.
        // Ensure the node has dimensions.
        const node = previewRef.current.firstElementChild as HTMLElement;
        if (!node) return;

        try {
            let dataUrl = '';
            if (format === 'png') {
                dataUrl = await toPng(node, { pixelRatio: 2 }); // 2x for better quality
            } else {
                dataUrl = await toSvg(node);
            }

            const link = document.createElement('a');
            link.download = `${diagram.title.replace(/\s+/g, '_')}_${format}.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed', err);
            alert('Download failed. Please try again.');
        }
    };

    const copyToClipboard = async () => {
        if (!previewRef.current) return;
        const node = previewRef.current.firstElementChild as HTMLElement;
        try {
            const blob = await toPng(node, { pixelRatio: 2 });
            // const item = new ClipboardItem({ 'image/png': blob }); // toPng returns dataUrl string, need blob
            // Need to convert dataUrl to Blob...
            const res = await fetch(blob);
            const b = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': b })
            ]);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Clipboard failed', err);
            // Fallback or alert
            alert('Setup clipboard permission or use download.');
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visualizer Column */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 flex items-center justify-center min-h-[500px]">
                    <div
                        ref={previewRef}
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>

                <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{diagram.title}</h1>
                        <p className="text-zinc-500 mt-1">{diagram.description}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDownload('png')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Download size={18} /> PNG
                        </button>
                        <button
                            onClick={() => handleDownload('svg')}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-colors"
                        >
                            <Download size={18} /> SVG
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-colors"
                            title="Copy Image"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Palette size={20} className="text-blue-500" />
                            Colors
                        </h3>
                        <button
                            onClick={() => {
                                const reset: Record<string, string> = {};
                                originalColors.forEach(c => reset[c] = c);
                                setColorMap(reset);
                            }}
                            className="text-xs text-zinc-500 hover:text-blue-600 flex items-center gap-1"
                        >
                            <RefreshCw size={12} /> Reset
                        </button>
                    </div>

                    <div className="space-y-3">
                        {originalColors.map((color, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {/* Color Preview */}
                                    <div className="w-6 h-6 rounded border border-zinc-200 shadow-sm" style={{ backgroundColor: color }}></div>
                                    <span className="text-sm font-mono text-zinc-500">{color}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400">→</span>
                                    <input
                                        type="color"
                                        value={colorMap[color] || color}
                                        onChange={(e) => handleColorChange(color, e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
                                    />
                                </div>
                            </div>
                        ))}

                        {originalColors.length === 0 && (
                            <p className="text-sm text-zinc-400 italic">No editable colors found in this SVG.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="font-semibold text-lg mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {diagram.tags.map(tag => (
                            <span key={tag} className="text-sm px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
