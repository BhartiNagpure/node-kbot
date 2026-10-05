import { Request, Response } from "express"
import { extractPdfText } from "../services/pdf.service";

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
            const uploadedFiles = await Promise.all(
                filesArray.map(async (file) => {
                    const text = await extractPdfText(file.path);
                    return {
                        originalName: file.originalname,
                        filename: file.filename,
                        path: file.path,
                        mimetype: file.mimetype,
                        size: file.size,
                        text,
                    };
                })
            );

            return res.status(200).json({
                success: true,
                message: `${filesArray.length} document(s) uploaded successfully`,
                files: uploadedFiles,
            });
        }

        if (singleFile) {
            const text = await extractPdfText(singleFile.path);
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
                text,
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


