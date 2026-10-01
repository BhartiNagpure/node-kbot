import express from "express";
import cors from "cors";
import testRoutes from './routes/test.routes'

const app = express()

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res)=>{
    res.json({
        success:true,
        message:"RAG backend is runnning"
    });
});

app.use("/api/test", testRoutes);

export default app;
