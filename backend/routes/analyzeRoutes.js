import express from 'express';
import { analyzeResume } from '../controllers/analyzeController.js';
import multer from 'multer';

const router = express.Router();

// Setup multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jobDescription', maxCount: 1 }]), analyzeResume);

export default router;
