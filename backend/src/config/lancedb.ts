import * as lancedb from '@lancedb/lancedb';

let db: lancedb.Connection;

export async function getLanceDB() {
    if (!db) {
        db = await lancedb.connect("./data/lancedb")
    }
    return db;
}

