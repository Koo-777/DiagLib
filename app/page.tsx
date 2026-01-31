import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Public Env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const revalidate = 60; // Revalidate every minute

async function getDiagrams() {
  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diagrams:', error);
    return [];
  }
  return data || [];
}

export default async function GalleryPage() {
  const diagrams = await getDiagrams();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Diag-Lib
          </Link>
          <div className="space-x-4">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Admin
            </Link>
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Portal Home
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">図解ギャラリー</h1>
        <p className="text-center text-gray-500 mb-8">
          カスタマイズ可能なSVG図解を無料ダウンロード
        </p>

        {diagrams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">まだ図解が登録されていません。</p>
            <p className="text-sm text-gray-400">AdminページからSVGをアップロードしてください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {diagrams.map((diag) => (
              <Link
                key={diag.id}
                href={`/item/${diag.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
              >
                <div className="aspect-video bg-gray-100 p-4 flex items-center justify-center">
                  <img src={diag.svg_url} alt={diag.title} className="max-h-full max-w-full" />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-1 truncate">{diag.title}</h2>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {diag.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
        <p>&copy; 2026 Apexia Lab. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="https://x.com/Apexia_Lab" target="_blank" rel="noopener noreferrer" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}
