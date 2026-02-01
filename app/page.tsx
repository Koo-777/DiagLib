import { supabase } from '@/lib/supabaseClient';
import { Diagram } from '@/types';
import { DiagramCard } from '@/components/DiagramCard';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // For search params and fresh data

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  let fetchQuery = supabase
    .from('diagrams')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    fetchQuery = fetchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data: diagrams, error } = await fetchQuery;

  if (error) {
    console.error('Error fetching diagrams:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">Diag</span>Lib
          </h1>

          <form action={async (formData) => {
            'use server';
            const q = formData.get('q');
            redirect(`/diag-lib?q=${encodeURIComponent(q as string)}`);
          }} className="relative w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-zinc-400" />
            </div>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search diagrams..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </form>
        </div>
      </header>

      {/* Mobile Search - Visible only on small screens */}
      <div className="md:hidden p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <form action={async (formData) => {
          'use server';
          const q = formData.get('q');
          redirect(`/diag-lib?q=${encodeURIComponent(q as string)}`);
        }} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full bg-zinc-50 dark:bg-zinc-800"
          />
        </form>
      </div>

      <main className="container mx-auto px-4 py-8">

        {query && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-zinc-500">Search results for <span className="text-zinc-900 dark:text-zinc-100">"{query}"</span></h2>
          </div>
        )}

        {!diagrams || diagrams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No diagrams found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diagrams.map((diagram: Diagram) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
