import openai from "../config/openai";

export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== "string") {
    throw new Error("Text input is required and must be a string");
  }

  const response: any = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2",
    input: text,
    input_type: "passage",
    truncate: "NONE"
  } as any);

  return response.data[0].embedding as number[];
}