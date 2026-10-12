import * as lancedb from '@lancedb/lancedb';
const DB_PATH = "./data/lancedb";

const TABLE_NAME = "documents";

let db: lancedb.Connection | null = null;

export async function getDB() {
    if (!db) {
        db = await lancedb.connect(DB_PATH);
    }
    return db;
}

export async function checkStoredChunks() {
    const database = await getDB();
    const tableNames = await database.tableNames();

    if (!tableNames.includes(TABLE_NAME)) {
        console.log(`Table '${TABLE_NAME}' does not exist yet.`);
        return 0;
    }

    const table = await database.openTable(TABLE_NAME);
    const rows = await table.query().toArray();

    // console.log("Stored record count:", rows.length);
    // console.log("First record:", rows[0]);

    return rows.length;
}


export interface ChunkRecord extends Record<string, unknown> {
    id: string;
    text: string;
    vector: number[];
    fileName: string;
    chunkIndex: number;
}

export async function saveChunks(records: ChunkRecord[]): Promise<ChunkRecord[]> {
    if (!records || records.length === 0) return [];

    const database = await getDB();
    const tableNames = await database.tableNames();
    const tableExists = tableNames.includes(TABLE_NAME);

    if (!tableExists) {
        await database.createTable(TABLE_NAME, records);
        console.log(`Created new table: ${TABLE_NAME} with ${records.length} records`);
    } else {
        const table = await database.openTable(TABLE_NAME);
        await table.add(records);
        console.log(`Added ${records.length} records to existing table: ${TABLE_NAME}`);
    }

    await checkStoredChunks();

    return records;
}

export async function saveChunk(
    chunk: string,
    embedding: number[],
    fileName: string,
    chunkIndex: number
): Promise<ChunkRecord> {
    const records = await saveChunks([{
        id: `${fileName}-${chunkIndex}`,
        text: chunk,
        vector: embedding,
        fileName,
        chunkIndex,
    }]);
    return records[0];
}