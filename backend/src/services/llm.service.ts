// import openai from "../config/openai";

// export interface ChatOptions {
//   model?: string;
//   temperature?: number;
//   max_tokens?: number;
//   stream?: false;
// }
// const context = `
// Current topic: Dal Tadka
// Relevant previous information:
// The user is preparing dal tadka and wants to know how to serve/mix it with rice.
// `;

// export async function generateChatCompletion(
//   input: string | Array<{ role: "system" | "user" | "assistant"; content: string }>,
//   options: ChatOptions = {}
// ) {
//   if (!input) {
//     throw new Error("Input parameter is required");
//   }

//   const model = options.model || process.env.LLM_MODEL || "meta/llama-3.2-11b-vision-instruct";
//   const temperature = options.temperature ?? 0.5;
//   const max_tokens = options.max_tokens ?? 1024;

//   const messages = typeof input === "string"
//     ? [
//       {
//         role: "system" as const,
//         content: `You are a helpful cooking assistant.
// Use the provided context only when it is relevant.
// Do not assume information that is not provided. `},
//       {
//         role: "user" as const,
//         content: `
// Previous context:
// ${context}

// Current question:
// ${input}
//     `,
//       }
//     ]
//     : input;

//   console.log(`Sending request to NVIDIA NIM API (Model: ${model})...`);
//   const start = Date.now();

//   try {
//     const completion = await openai.chat.completions.create({
//       model,
//       messages,
//       temperature,
//       max_tokens,
//       stream: false,
//     });

//     console.log(`NVIDIA NIM Response received in ${Date.now() - start} ms`);

//     const reply = completion.choices[0]?.message?.content || "";

//     return {
//       model,
//       reply,
//       completion,
//     };
//   } catch (error: any) {
//     console.error("Error calling NVIDIA NIM:", error);
//     if (error?.status) console.error("Status:", error.status);
//     if (error?.message) console.error("Message:", error.message);

//     throw error;
//   }
// }


import openai from "../config/openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: false;
}

export const ECOMMERCE_SYSTEM_PROMPT = `You are an expert E-Commerce Customer Support & Product Assistant.
Your goal is to provide accurate, helpful, and friendly responses to customer inquiries based STRICTLY on the retrieved product catalog, manuals, and store policy documents provided.

=== GUIDELINES ===
1. GROUNDED IN INFORMATION: Rely ONLY on the provided context. Do NOT invent prices, discounts, stock availability, specifications, or return policies not present in the context.
2. MISSING DATA HANDLING: If details are missing, respond: "I'm sorry, but I couldn't find details regarding [topic] in our current catalog or policy guidelines. Please contact customer support for further assistance."
3. PRODUCT SPECIFICATIONS & PRICING: State exact prices, model names, SKU numbers, dimensions, and materials exactly as listed in the retrieved documents.
4. POLICIES & SHIPPING: Clearly state return windows, warranty terms, and delivery timeframes when applicable.
5. TONE: Maintain a polite, engaging, and professional customer-centric tone.`;

export function buildEcommercePrompt(userQuery: string, contextDocuments: string): string {
  return `
${ECOMMERCE_SYSTEM_PROMPT}

=== CONTEXT ===
${contextDocuments}

=== CUSTOMER QUESTION ===
${userQuery}

=== ANSWER ===
`;
}

export async function generateChatCompletion(
  input: string | ChatMessage[],
  options: ChatOptions = {}
) {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    throw new Error("Input or messages are required");
  }

  let messages: ChatMessage[];

  if (typeof input === "string") {
    messages = [
      { role: "system", content: ECOMMERCE_SYSTEM_PROMPT },
      { role: "user", content: input }
    ];
  } else {
    const hasSystemMessage = input.some((m) => m.role === "system");
    messages = hasSystemMessage
      ? input
      : [{ role: "system", content: ECOMMERCE_SYSTEM_PROMPT }, ...input];
  }

  const model =
    options.model ||
    process.env.LLM_MODEL ||
    "meta/llama-3.2-11b-vision-instruct";

  const temperature = options.temperature ?? 0.5;
  const max_tokens = options.max_tokens ?? 1024;

  console.log(
    `Sending request to NVIDIA NIM API (Model: ${model})...`
  );

  const start = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    });

    console.log(
      `NVIDIA NIM Response received in ${Date.now() - start} ms`
    );

    const reply =
      completion.choices[0]?.message?.content || "";

    return {
      model,
      reply,
      completion,
    };
  } catch (error: any) {
    console.error("Error calling NVIDIA NIM:", error);

    throw error;
  }
}