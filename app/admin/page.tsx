'use client';

import { useState } from 'react';
import { uploadDiagram } from '../actions';

export default function AdminPage() {
    const [status, setStatus] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsUploading(true);
        setStatus('Processing...');

        const formData = new FormData(event.currentTarget);
        const result = await uploadDiagram(formData);

        if (result.error) {
            setStatus(`Error: ${result.error}`);
        } else {
            setStatus('Success! Diagram uploaded and processed by AI.');
            (event.target as HTMLFormElement).reset();
        }
        setIsUploading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Upload</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SVG File</label>
                        <input
                            type="file"
                            name="file"
                            accept=".svg"
                            required
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isUploading ? 'Uploading & Analyzing...' : 'Upload Diagram'}
                    </button>
                </form>

                {status && (
                    <div className={`mt-4 p-3 rounded text-sm ${status.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {status}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a href="/diag-lib" className="text-sm text-blue-600 hover:underline">Back to Gallery</a>
                </div>
            </div>
        </div>
    );
}
