import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NVIDIA_API_KEY) {
  throw new Error("NVIDIA_API_KEY is not set in .env");
}

export const nim = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export const NIM_CHAT_MODEL = "meta/llama-3.3-70b-instruct";
export const NIM_EMBED_MODEL = "nvidia/nv-embedqa-e5-v5";