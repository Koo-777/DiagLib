export type Diagram = {
    id: string;
    title: string;
    description: string;
    tags: string[];
    colors: string[]; // JSONB stored as array of strings (hex codes or vars)
    svg_url: string;
    created_at: string;
    updated_at: string;
};

export type DiagramInput = {
    title: string;
    description: string;
    tags: string[];
    colors: string[];
    svg_url?: string;
};
