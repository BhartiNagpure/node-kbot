

export function cleanText(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .trim();
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {

    const chunks: string[] = [];

    let start = 0;
    while (start < text.length) {
        const end = start + chunkSize;

        const chunk = text.slice(start, end);

        chunks.push(chunk);
        start += chunkSize - overlap;
    }
    return chunks;
}

