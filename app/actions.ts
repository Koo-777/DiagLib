'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use Service Key for Admin write access
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

const adminPassword = process.env.ADMIN_PASSWORD || ''; // Set this in .env.local

export async function uploadDiagram(formData: FormData) {
    const password = formData.get('password') as string;
    if (password !== adminPassword) {
        return { error: 'Invalid admin password' };
    }

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file uploaded' };

    // 1. Upload SVG to Supabase Storage
    const filename = `${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diagram-assets')
        .upload(filename, buffer, {
            contentType: 'image/svg+xml',
            upsert: false,
        });

    if (uploadError) {
        return { error: `Upload failed: ${uploadError.message}` };
    }

    const svgUrl = `${supabaseUrl}/storage/v1/object/public/diagram-assets/${filename}`;

    // 2. Analyze with Gemini (Generate Title/Tags)
    let title = 'New Diagram';
    let description = '';
    let tags: string[] = [];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "This is an SVG diagram. Please generate a concise title (max 50 chars), a short description (max 100 chars), and 3-5 relevant tags (comma separated) for this image. Output JSON format: { \"title\": \"...\", \"description\": \"...\", \"tags\": [\"tag1\", \"tag2\"] }";

        // For Gemini, we need Base64.
        const base64Data = Buffer.from(buffer).toString('base64');

        // Check if the file is small enough for inline data, otherwise we might need file API (for larger files).
        // Assuming SVGs are small text-based files, inline should work or we pass text content if we read it as string.
        // Let's try passing as image part.
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/svg+xml"
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from code block
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const metadata = JSON.parse(jsonMatch[0]);
            title = metadata.title || title;
            description = metadata.description || description;
            tags = metadata.tags || tags;
        }
    } catch (e) {
        console.error('Gemini Analysis Failed:', e);
        // Continue without AI metadata if it fails (maintain zero cost reliability)
    }

    // 3. Insert into DB
    const { error: dbError } = await supabase.from('diagrams').insert({
        title,
        description,
        tags,
        svg_url: svgUrl,
    });

    if (dbError) {
        return { error: `DB Insert failed: ${dbError.message}` };
    }

    return { success: true };
}
