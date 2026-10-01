import { Request, Response } from "express";
import { createEmbedding } from "../services/embedding.service";
import { generateChatCompletion, ChatMessage } from "../services/llm.service";

export async function testEmbedding(
    req: Request,
    res: Response
) {
    try {
        const { text } = req.body || {};

        if (!text || typeof text !== "string") {
            return res.status(400).json({
                success: false,
                message: "Embedding failed: 'text' field is required in request body and must be a string."
            });
        }

        const embedding = await createEmbedding(text);

        return res.json({
            success: true,
            dimensions: embedding.length,
            embedding
        });
    } catch (error: any) {
        console.error("Embedding Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Embedding failed",
            error: error?.message || "Unknown error occurred"
        });
    }
}

// In-memory chat session store for multi-turn conversations
const chatSessions: Record<string, ChatMessage[]> = {};

export async function testChat(
    req: Request,
    res: Response
) {
    try {
        const { message, text, prompt, messages, sessionId, clearHistory } = req.body || {};
        const currentSessionId = sessionId || "default";

        if (clearHistory) {
            chatSessions[currentSessionId] = [];
            return res.json({
                success: true,
                message: `Chat history cleared for session '${currentSessionId}'`
            });
        }

        let chatInput: ChatMessage[];
        const isExplicitMessages = Array.isArray(messages);

        if (isExplicitMessages) {
            // Client explicitly provides full messages history array
            chatInput = messages;
        } else {
            // Client provides single prompt; store/retrieve session history
            const userContent = message || text || prompt || "Hi";

            if (!chatSessions[currentSessionId]) {
                chatSessions[currentSessionId] = [];
            }

            // Append current user message
            chatSessions[currentSessionId].push({
                role: "user",
                content: userContent
            });

            // Keep last 20 messages to prevent payload context overflow
            if (chatSessions[currentSessionId].length > 20) {
                chatSessions[currentSessionId] = chatSessions[currentSessionId].slice(-20);
            }

            chatInput = chatSessions[currentSessionId];
        }

        const { model, reply } = await generateChatCompletion(chatInput);

        // Store assistant reply in session history when using session-based tracking
        if (!isExplicitMessages && chatSessions[currentSessionId]) {
            chatSessions[currentSessionId].push({
                role: "assistant",
                content: reply
            });
        }

        return res.json({
            success: true,
            sessionId: currentSessionId,
            model,
            reply
        });
    } catch (error: any) {
        console.error("Chat Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "LLM Chat call failed",
            error: error?.message || "Unknown error occurred"
        });
    }
}