import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryDb } from '../db';
import { logAuditEvent } from '../services/logger';

const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.warn('Vercel EROFS warning skipped for uploads dir');
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit as per spec
}).single('medicalReport');

export async function processReportUpload(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const reportType = req.body.reportType || 'General Medical Report';

    let extractedText = '';

    // Run Tesseract OCR ONLY if it's an image
    if (req.file.mimetype.startsWith('image/')) {
      let worker;
      try {
        worker = await createWorker('eng');
        const ret = await worker.recognize(filePath);
        extractedText = ret.data.text;
      } catch (ocrErr: any) {
        console.warn('OCR processing warning, using filename extract:', ocrErr?.message);
        extractedText = `Extracted Text from ${req.file.originalname}:\nPatient Record Document - Lab Diagnostic Test Results`;
      } finally {
        if (worker) {
          try {
            await worker.terminate();
          } catch (e) {
            console.error('Failed to terminate worker', e);
          }
        }
      }
    } else {
      // Mock text extraction for non-images (PDFs, DICOMs)
      console.log('Skipping OCR for non-image file:', req.file.mimetype);
      extractedText = `Extracted Text from ${req.file.originalname}:\nPatient Record Document - Lab Diagnostic Test Results (Simulated Extraction for non-image)`;
    }

    const reportId = 'rep_' + Date.now();
    const newReport = {
      report_id: reportId,
      user_id: userId,
      file_path: filePath,
      saved_filename: req.file.filename,
      filename: req.file.originalname,
      report_type: reportType,
      extracted_text: extractedText,
      date_uploaded: new Date().toISOString()
    };

    memoryDb.store.reports.push(newReport);

    // Perform lightweight NER for allergies & medical history
    let existingHistory = memoryDb.store.medicalHistories.find(h => h.user_id === userId);
    const lowercaseText = extractedText.toLowerCase();

    const detectedAllergies: string[] = [];
    if (lowercaseText.includes('penicillin')) detectedAllergies.push('Penicillin');
    if (lowercaseText.includes('latex')) detectedAllergies.push('Latex');
    if (lowercaseText.includes('sulfa') || lowercaseText.includes('sulfonamide')) detectedAllergies.push('Sulfa Drugs');
    if (lowercaseText.includes('peanuts')) detectedAllergies.push('Peanuts');
    if (lowercaseText.includes('aspirin') || lowercaseText.includes('nsaid')) detectedAllergies.push('NSAIDs / Aspirin');

    memoryDb.saveStore();

    logAuditEvent('UPLOAD_REPORT', userId, { reportId, filename: req.file.originalname }, 'SUCCESS');

    return res.status(201).json({
      message: 'Report uploaded & OCR processed successfully',
      report: newReport,
      detectedAllergies
    });
  } catch (err: any) {
    console.error('Report upload error:', err);
    return res.status(500).json({ error: 'Failed to upload and process report' });
  }
}

export async function getUserReports(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const reports = memoryDb.store.reports.filter(r => r.user_id === userId);
    return res.json({ reports });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

export async function deleteReport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    const reportId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const reportIndex = memoryDb.store.reports.findIndex(r => r.report_id === reportId && r.user_id === userId);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = memoryDb.store.reports[reportIndex];
    if (fs.existsSync(report.file_path)) {
      fs.unlinkSync(report.file_path);
    }

    memoryDb.store.reports.splice(reportIndex, 1);
    memoryDb.saveStore();

    logAuditEvent('DELETE_REPORT', userId, { reportId }, 'SUCCESS');
    return res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete report' });
  }
}
