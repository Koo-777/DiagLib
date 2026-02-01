import Link from 'next/link';
import { Diagram } from '@/types';
import { Calendar, Tag } from 'lucide-react';

interface DiagramCardProps {
    diagram: Diagram;
}

export function DiagramCard({ diagram }: DiagramCardProps) {
    return (
        <Link href={`/diagram/${diagram.id}`} className="block group">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-800 dark:border-zinc-700">
                <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Using img tag for list view for performance. Detail view will inline SVG. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={diagram.svg_url}
                        alt={diagram.title}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100 line-clamp-1">{diagram.title}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {diagram.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                                <Tag size={10} /> {tag}
                            </span>
                        ))}
                        {diagram.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300">
                                +{diagram.tags.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(diagram.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </Link>
    );
}
