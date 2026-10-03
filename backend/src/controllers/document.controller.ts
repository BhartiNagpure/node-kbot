import { Request, Response } from "express"

export async function uploadDocument(
    req: Request,
    res: Response
) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a valid PDF document (Max size: 10MB)"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Document uploaded successfully",

            file: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
        });
    } catch (error: any) {
        console.error("Document upload failed", error);
        return res.status(500).json({
            success: false,
            message: "Document upload failed",
            error: error?.message || "Unknown error"
        })
    }
}
