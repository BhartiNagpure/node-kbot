import { createEmbedding } from "./embedding.service";
import { getDB } from "./lancedb.service";


export async function searchsimilarChunk(
    question: string,
    limit: number = 3
) {
    const questionEmbedding = await createEmbedding(question);
    const db = await getDB();

    try {
        const tableNames = await db.tableNames();
        if (!tableNames.includes("documents")) {
            return [];
        }

        const table = await db.openTable("documents");
        const results = await table
            .search(questionEmbedding)
            .limit(limit)
            .toArray();

        return results.map((row: any) => ({
            text: row.text,
            fileName: row.fileName || row.filename,
            chunkIndex: row.chunkIndex,
            distance: row._distance
        }));
    } catch (err: any) {
        console.warn("LanceDB search warning (table unreadable or uninitialized):", err?.message || err);
        return [];
    }
}
