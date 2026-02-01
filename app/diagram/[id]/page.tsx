
import { supabase } from '@/lib/supabaseClient';
import { Diagram } from '@/types';
import { DiagramEditor } from '@/components/DiagramEditor';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DiagramPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // 1. Fetch Diagram Metadata
    const { data: diagram, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !diagram) {
        console.error("Diagram fetch error:", error);
        return notFound();
    }

    // 2. Fetch SVG Content
    // We need the raw text content of the SVG to manipulate it on the client.
    // Since the SVG is in a public bucket, we can fetch it.
    const svgResponse = await fetch(diagram.svg_url, { cache: 'no-store' });
    const svgContent = await svgResponse.text();

    if (!svgResponse.ok) {
        console.error("SVG fetch error:", svgContent);
        // We can fail gracefully?
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Link href="/diag-lib" className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ChevronLeft size={20} />
                        <span className="ml-1 font-medium">Back to Gallery</span>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <DiagramEditor diagram={diagram as Diagram} initialSvgContent={svgContent} />
            </main>
        </div>
    );
}
