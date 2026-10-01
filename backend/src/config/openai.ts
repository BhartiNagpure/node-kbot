import OpenAI from "openai";

const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("Warning: NVIDIA_API_KEY / OPENAI_API_KEY is not defined in environment variables.");
}

const openai = new OpenAI({
  apiKey: apiKey || "dummy-key",
  baseURL: process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export default openai;