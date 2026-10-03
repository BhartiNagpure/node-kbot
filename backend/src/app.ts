import express from "express";
import cors from "cors";
import testRoutes from './routes/test.routes'
import documentRoutes from './routes/document.routes'

const app = express()

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "RAG backend is runnning"
    });
});

app.use("/api/test", testRoutes);
app.use("/api/document", documentRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(err.status || 400).json({
        success: false,
        message: err.message || "An error occurred during file upload",
    });
});

export default app;
