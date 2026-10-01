import openai from "../config/openai";

export async function createEmbedding(text: string) {
  if (!text || typeof text !== "string") {
    throw new Error("Text input is required and must be a string");
  }

  const response = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL || "nvidia/llama-3.2-nv-embedqa-1b-v1",
    input: text,
    extra_body: {
      input_type: "passage",
      truncate: "NONE"
    }
  } as any);

  return response.data[0].embedding;
}