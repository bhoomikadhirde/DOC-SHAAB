import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryDb } from '../db';
import { encryptPHI, decryptPHI } from '../services/crypto';
import { logAuditEvent } from '../services/logger';

export async function upsertMedicalHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { diseases, allergies, chronic_conditions, past_treatments, primary_concerns, blood_group } = req.body;

    let history = memoryDb.store.medicalHistories.find(h => h.user_id === userId);

    if (history) {
      history.diseases = diseases ? encryptPHI(JSON.stringify(diseases)) : history.diseases;
      history.allergies = allergies ? encryptPHI(JSON.stringify(allergies)) : history.allergies;
      history.chronic_conditions = chronic_conditions ? encryptPHI(JSON.stringify(chronic_conditions)) : history.chronic_conditions;
      history.past_treatments = past_treatments ? encryptPHI(JSON.stringify(past_treatments)) : history.past_treatments;
      history.primary_concerns = primary_concerns || history.primary_concerns;
      history.blood_group = blood_group || history.blood_group;
      history.updated_at = new Date().toISOString();
    } else {
      history = {
        history_id: 'hist_' + Date.now(),
        user_id: userId,
        diseases: encryptPHI(JSON.stringify(diseases || [])),
        allergies: encryptPHI(JSON.stringify(allergies || [])),
        chronic_conditions: encryptPHI(JSON.stringify(chronic_conditions || [])),
        past_treatments: encryptPHI(JSON.stringify(past_treatments || [])),
        primary_concerns: primary_concerns || [],
        blood_group: blood_group || 'O+',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryDb.store.medicalHistories.push(history);
    }

    memoryDb.saveStore();
    logAuditEvent('UPDATE_MEDICAL_HISTORY', userId, { history_id: history.history_id }, 'SUCCESS');

    return res.json({
      message: 'Medical history updated successfully',
      medicalHistory: {
        ...history,
        diseases: JSON.parse(decryptPHI(history.diseases) || '[]'),
        allergies: JSON.parse(decryptPHI(history.allergies) || '[]'),
        chronic_conditions: JSON.parse(decryptPHI(history.chronic_conditions) || '[]'),
        past_treatments: JSON.parse(decryptPHI(history.past_treatments) || '[]')
      }
    });
  } catch (err: any) {
    console.error('Medical history error:', err);
    return res.status(500).json({ error: 'Failed to update medical history' });
  }
}

export async function getMedicalHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const history = memoryDb.store.medicalHistories.find(h => h.user_id === userId);
    if (!history) {
      return res.json({ medicalHistory: null });
    }

    return res.json({
      medicalHistory: {
        ...history,
        diseases: JSON.parse(decryptPHI(history.diseases) || '[]'),
        allergies: JSON.parse(decryptPHI(history.allergies) || '[]'),
        chronic_conditions: JSON.parse(decryptPHI(history.chronic_conditions) || '[]'),
        past_treatments: JSON.parse(decryptPHI(history.past_treatments) || '[]')
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch medical history' });
  }
}

export async function getVitalsAndDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = memoryDb.store.users.find(u => u.user_id === userId);
    const historyRaw = memoryDb.store.medicalHistories.find(h => h.user_id === userId);
    const history = historyRaw ? {
      ...historyRaw,
      allergies: JSON.parse(decryptPHI(historyRaw.allergies) || '[]'),
      diseases: JSON.parse(decryptPHI(historyRaw.diseases) || '[]'),
      chronic_conditions: JSON.parse(decryptPHI(historyRaw.chronic_conditions) || '[]'),
      past_treatments: JSON.parse(decryptPHI(historyRaw.past_treatments) || '[]')
    } : null;

    const reports = memoryDb.store.reports.filter(r => r.user_id === userId);
    const medications = memoryDb.store.medications.filter(m => m.user_id === userId);

    // Simulated high-precision vital sparklines
    const vitals = {
      heartRate: { current: 72, unit: 'BPM', status: 'Normal', trend: [68, 70, 74, 71, 75, 72] },
      bloodOxygen: { current: 98, unit: '%', status: 'Optimal', trend: [97, 98, 98, 99, 98, 98] },
      sleepQuality: { current: 8.2, unit: 'hrs', status: 'Good', trend: [7.1, 7.8, 8.0, 8.5, 8.2] },
      bloodPressure: { current: '120/80', unit: 'mmHg', status: 'Normal', trend: ['118/79', '122/81', '120/80'] }
    };

    return res.json({
      user: {
        user_id: user?.user_id,
        name: user?.name,
        age: user?.age,
        gender: user?.gender,
        bloodGroup: history?.blood_group || 'O+ (Positive)'
      },
      medicalHistory: history,
      vitals,
      recentRecords: reports.map(r => ({
        report_id: r.report_id,
        filename: r.filename,
        report_type: r.report_type,
        date_uploaded: r.date_uploaded,
        snippet: r.extracted_text ? r.extracted_text.substring(0, 120) + '...' : 'No preview'
      })),
      medications
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
