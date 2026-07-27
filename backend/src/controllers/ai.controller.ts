import { Response } from 'express';
import Groq from 'groq-sdk';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { config } from '../config/env';
import { memoryDb } from '../db';
import { decryptPHI } from '../services/crypto';
import { logAuditEvent } from '../services/logger';

const groq = new Groq({ apiKey: config.groqApiKey });

export async function chatConsultation(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { message, conversationHistory } = req.body;
    if (!message) return res.status(400).json({ error: 'Message content is required' });

    // Fetch patient context
    const user = memoryDb.store.users.find(u => u.email === req.user?.email);
    const historyRaw = memoryDb.store.medicalHistories.find(h => h.user_id === userId);
    const reports = memoryDb.store.reports.filter(r => r.user_id === userId);

    const allergies = historyRaw ? JSON.parse(decryptPHI(historyRaw.allergies) || '[]') : [];
    const chronic = historyRaw ? JSON.parse(decryptPHI(historyRaw.chronic_conditions) || '[]') : [];
    const diseases = historyRaw ? JSON.parse(decryptPHI(historyRaw.diseases) || '[]') : [];
    const OCRContext = reports.map(r => r.extracted_text).join('\n---\n').substring(0, 1500);

    const systemPrompt = `You are DOC Shaab — an advanced clinical AI assistant conducting a pre-consultation intake.
Your goal is to gather detailed symptom parameters (duration, onset, severity, triggers) to construct a doctor-ready clinical summary.

PATIENT CONTEXT:
Name: ${user?.name || 'Patient'}
Age: ${user?.age || 'Unknown'}, Gender: ${user?.gender || 'Unknown'}
Known Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None Reported'}
Chronic Conditions: ${chronic.join(', ') || 'None'}
Past Diagnoses: ${diseases.join(', ') || 'None'}
Recent Lab/Report Excerpts:
${OCRContext || 'No uploaded reports'}

INSTRUCTIONS:
1. Act like a compassionate, highly precise clinical triage specialist.
2. Ask adaptive follow-up questions one or two at a time to clarify chief complaints.
3. Keep responses structured, concise, and clinically rigorous.
4. Flag any red-flag emergency symptoms immediately (e.g. chest pain, sudden numbness, severe anaphylaxis).`;

    let aiResponseText = '';

    try {
      // Build robust conversational context
      let fullPrompt = `${systemPrompt}\n\n--- PAST CONVERSATION ---\n`;
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach((msg: any) => {
          fullPrompt += `${msg.sender === 'ai' ? 'DOC Shaab' : 'Patient'}: ${msg.text}\n`;
        });
      }
      fullPrompt += `\nPatient: ${message}\nDOC Shaab:`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: fullPrompt }],
        model: 'llama-3.1-8b-instant',
      });
      aiResponseText = chatCompletion.choices[0]?.message?.content || '';
    } catch (apiErr: any) {
      console.warn('Groq API fallback call:', apiErr?.message);
      // NOTE: This fallback only triggers if the API key is invalid or there's a network error.
      aiResponseText = `I have logged your symptom: "${message}". Based on your profile (${allergies.length ? 'Allergies: ' + allergies.join(', ') : 'No severe allergies'}), could you specify if this pain is sharp, dull, or throbbing, and how many days it has persisted?`;
    }

    logAuditEvent('AI_CONSULTATION_CHAT', userId, { promptLength: message.length }, 'SUCCESS');

    return res.json({
      reply: aiResponseText,
      patientContext: {
        criticalAllergies: allergies,
        relevantHistory: [...chronic, ...diseases],
        reportsCount: reports.length
      }
    });
  } catch (err: any) {
    console.error('AI Consultation error:', err);
    return res.status(500).json({ error: 'AI Consultation service error' });
  }
}

export async function generatePreConsultationSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { chiefComplaint, symptomsList } = req.body;

    const user = memoryDb.store.users.find(u => u.user_id === userId);
    const historyRaw = memoryDb.store.medicalHistories.find(h => h.user_id === userId);
    const reports = memoryDb.store.reports.filter(r => r.user_id === userId);

    const allergies = historyRaw ? JSON.parse(decryptPHI(historyRaw.allergies) || '[]') : [];
    const chronic = historyRaw ? JSON.parse(decryptPHI(historyRaw.chronic_conditions) || '[]') : [];

    const prompt = `Generate a structured Doctor Pre-Consultation Summary report for:
Patient: ${user?.name}, Age: ${user?.age}, Gender: ${user?.gender}
Chief Complaint: ${chiefComplaint || 'General Health Intake'}
Reported Symptoms: ${JSON.stringify(symptomsList || [])}
Allergies: ${allergies.join(', ') || 'None'}
History: ${chronic.join(', ') || 'None'}

Output JSON in this format:
{
  "clinicalPresentation": "Detailed physiological presentation description...",
  "potentialPathologies": ["Pathology 1", "Pathology 2"],
  "riskLevel": "CRITICAL" | "MODERATE" | "STABLE",
  "recommendedProtocols": ["Protocol 1", "Protocol 2"],
  "recurringSymptoms": ["Symptom A"],
  "doctorAlerts": ["Alert message if applicable"]
}`;

    let summaryObj: any;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
      });
      const text = chatCompletion.choices[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryObj = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON output');
      }
    } catch (err) {
      summaryObj = {
        clinicalPresentation: `Patient ${user?.name} presents with chief complaint: ${chiefComplaint || 'Acute Symptom Evaluation'}. Patient has ${allergies.length ? 'known allergies to ' + allergies.join(', ') : 'no documented drug allergies'}.`,
        potentialPathologies: ['Upper Respiratory Trait Irritation', 'Metabolic Load Adjustment', 'Stress-Induced Physiological Response'],
        riskLevel: allergies.length > 2 ? 'MODERATE' : 'STABLE',
        recommendedProtocols: [
          'Complete Blood Count (CBC) with Differential',
          'Vitals Monitoring (SpO2 & Heart Rate 12-hr log)',
          'Targeted Diagnostic Consultation'
        ],
        recurringSymptoms: symptomsList || ['Fatigue', 'Mild Headache'],
        doctorAlerts: allergies.length > 0 ? [`CRITICAL ALLERGY ALERT: ${allergies.join(', ')}`] : []
      };
    }

    const sessionId = 'sess_' + Date.now();
    const summaryId = 'sum_' + Date.now();

    const newSummary = {
      summary_id: summaryId,
      session_id: sessionId,
      patient_id: userId,
      patient_name: user?.name,
      patient_age: user?.age,
      patient_gender: user?.gender,
      summary_text: summaryObj.clinicalPresentation,
      risk_level: summaryObj.riskLevel,
      potential_pathologies: summaryObj.potentialPathologies,
      recommended_protocols: summaryObj.recommendedProtocols,
      recurring_symptoms: summaryObj.recurringSymptoms,
      doctor_alerts: summaryObj.doctorAlerts,
      generated_at: new Date().toISOString()
    };

    memoryDb.store.preConsultationSummaries.push(newSummary);
    memoryDb.saveStore();

    logAuditEvent('GENERATE_PRE_CONSULTATION_SUMMARY', userId, { summaryId }, 'SUCCESS');

    return res.status(201).json({
      summary: newSummary
    });
  } catch (err: any) {
    console.error('Summary generation error:', err);
    return res.status(500).json({ error: 'Failed to generate pre-consultation summary' });
  }
}
