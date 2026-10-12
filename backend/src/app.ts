import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/documents", documentRoutes);

export default app;
