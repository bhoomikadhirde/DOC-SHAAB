import { Router } from 'express';
import { registerUser, verifyMFAAndLogin, getCurrentUser, logoutUser, updateUser, deleteUser } from '../controllers/auth.controller';
import { upsertMedicalHistory, getMedicalHistory, getVitalsAndDashboard } from '../controllers/patient.controller';
import { processReportUpload, uploadMiddleware, getUserReports, deleteReport } from '../controllers/report.controller';
import { chatConsultation, generatePreConsultationSummary } from '../controllers/ai.controller';
import { getNearbyFacilities } from '../controllers/facility.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Auth Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', verifyMFAAndLogin);
router.get('/auth/me', requireAuth, getCurrentUser);
router.put('/auth/user', requireAuth, updateUser);
router.delete('/auth/user', requireAuth, deleteUser);
router.post('/auth/logout', logoutUser);

// Patient & EHR Routes
router.post('/patient/history', requireAuth, upsertMedicalHistory);
router.get('/patient/history', requireAuth, getMedicalHistory);
router.get('/patient/dashboard', requireAuth, getVitalsAndDashboard);

// Report Upload & OCR Routes
router.post('/reports/upload', requireAuth, uploadMiddleware, processReportUpload);
router.get('/reports', requireAuth, getUserReports);
router.delete('/reports/:id', requireAuth, deleteReport);

// AI Pre-Consultation Engine Routes
router.post('/ai/chat', requireAuth, chatConsultation);
router.post('/ai/summary', requireAuth, generatePreConsultationSummary);

// Facility Locator Routes
router.get('/facilities', getNearbyFacilities);

export default router;
