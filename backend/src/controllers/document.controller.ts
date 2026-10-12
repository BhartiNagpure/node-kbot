import { Request, Response } from "express"
import { extractPdfText } from "../services/pdf.service";
import { cleanText, chunkText } from "../services/text.service";
import { createEmbedding } from "../services/embedding.service";
import { saveChunks, ChunkRecord } from "../services/lancedb.service";
import { searchsimilarChunk } from "../services/retrieval.service";


export async function uploadDocument(
    req: Request,
    res: Response
) {
    try {
        const filesArray = req.files as Express.Multer.File[] | undefined;
        const singleFile = req.file;

        if ((!filesArray || filesArray.length === 0) && !singleFile) {
            return res.status(400).json({
                success: false,
                message: "Please upload a valid PDF document (Max size: 10MB)"
            });
        }

        if (filesArray && filesArray.length > 0) {
            const uploadedFiles = [];
            const allRecords: ChunkRecord[] = [];

            for (const file of filesArray) {
                const text = await extractPdfText(file.path);
                const cleanedText = cleanText(text);
                const chunks = chunkText(cleanedText);

                const embeddings: number[][] = [];

                for (let i = 0; i < chunks.length; i++) {
                    const embedding = await createEmbedding(chunks[i]);
                    embeddings.push(embedding);
                    allRecords.push({
                        id: `${file.originalname}-${i}`,
                        text: chunks[i],
                        vector: embedding,
                        fileName: file.originalname,
                        chunkIndex: i,
                    });
                }

                uploadedFiles.push({
                    originalName: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    mimetype: file.mimetype,
                    size: file.size,
                    chunkCount: chunks.length,
                    embeddingCount: embeddings.length,
                });
            }

            if (allRecords.length > 0) {
                await saveChunks(allRecords);
            }

            return res.status(200).json({
                success: true,
                message: `${filesArray.length} document(s) uploaded successfully`,
                files: uploadedFiles,
            });
        }

        if (singleFile) {
            const text = await extractPdfText(singleFile.path);
            const cleanedText = cleanText(text);
            const chunks = chunkText(cleanedText);

            const embeddings: number[][] = [];
            const records: ChunkRecord[] = [];

            for (let i = 0; i < chunks.length; i++) {
                const embedding = await createEmbedding(chunks[i]);
                embeddings.push(embedding);
                records.push({
                    id: `${singleFile.originalname}-${i}`,
                    text: chunks[i],
                    vector: embedding,
                    fileName: singleFile.originalname,
                    chunkIndex: i,
                });
            }

            if (records.length > 0) {
                await saveChunks(records);
            }

            return res.status(200).json({
                success: true,
                message: "Document uploaded successfully",
                file: {
                    originalName: singleFile.originalname,
                    filename: singleFile.filename,
                    path: singleFile.path,
                    mimetype: singleFile.mimetype,
                    size: singleFile.size,
                },
                chunkCount: chunks.length,
                embeddingCount: embeddings.length,
            });
        }
    } catch (error: any) {
        console.error("Document upload failed", error);
        return res.status(500).json({
            success: false,
            message: "Document upload failed",
            error: error?.message || "Unknown error"
        });
    }
}


export async function searchDocuments(
    req: Request,
    res: Response
) {
    try {
        const { question } = req.body;

        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const results = await searchsimilarChunk(question.trim(), 3);

        return res.status(200).json({
            success: true,
            question,
            resultCount: results.length,
            results,

        });
    } catch (error: any) {
        console.error("Document search failed", error);
        return res.status(500).json({
            success: false,
            message: "Document search failed",
            error: error?.message || "Unknown error"
        });
    }

}

