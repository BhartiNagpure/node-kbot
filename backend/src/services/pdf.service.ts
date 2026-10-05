import fs from "fs";
const { PDFParse } = require("pdf-parse");

export async function extractPdfText(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    return result.text || "";
}
