import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import { searchDocuments, uploadDocument } from "../controllers/document.controller";


const router = Router();

// router.post(
//     "/upload",
//     upload.single("file"),
//     uploadDocument
// );

router.post(
    "/upload",
    upload.array("files", 3),
    uploadDocument
);

router.post(
    "/search",
    searchDocuments
)
export default router;