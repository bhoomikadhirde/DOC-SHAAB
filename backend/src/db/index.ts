import { Pool } from 'pg';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

// In-Memory / File-based Persistent Store Fallback
const dbFilePath = path.join(__dirname, '../../db_store.json');

interface MemoryStore {
  users: any[];
  medicalHistories: any[];
  reports: any[];
  symptomLogs: any[];
  medications: any[];
  aiInsights: any[];
  embeddings: any[];
  consultationSessions: any[];
  preConsultationSummaries: any[];
  medicalFacilities: any[];
  facilityRecommendations: any[];
  notifications: any[];
}

let store: MemoryStore = {
  users: [],
  medicalHistories: [],
  reports: [],
  symptomLogs: [],
  medications: [],
  aiInsights: [],
  embeddings: [],
  consultationSessions: [],
  preConsultationSummaries: [],
  medicalFacilities: [],
  facilityRecommendations: [],
  notifications: []
};

// Seed default dummy facilities if empty
function seedDefaultFacilities() {
  if (store.medicalFacilities.length === 0) {
    store.medicalFacilities = [
      {
        facility_id: 'fac-1',
        name: 'City General Hospital & Trauma Center',
        facility_type: 'Tertiary Care Hospital',
        location: { lat: 18.5204, lng: 73.8567, address: '45 Healthcare Ave, Central District' },
        rating: 4.8,
        contact: '+1 (555) 019-2831'
      },
      {
        facility_id: 'fac-2',
        name: 'Apollo Specialty Medical Clinic',
        facility_type: 'Multi-Specialty Clinic',
        location: { lat: 18.5314, lng: 73.8447, address: '128 Wellness Blvd, West Wing' },
        rating: 4.6,
        contact: '+1 (555) 014-9922'
      },
      {
        facility_id: 'fac-3',
        name: 'St. Jude Urgent Care & Cardiac Institute',
        facility_type: 'Urgent Care Center',
        location: { lat: 18.5124, lng: 73.8697, address: '89 Cardiology Way, Eastside' },
        rating: 4.9,
        contact: '+1 (555) 018-7734'
      }
    ];
  }
}

function loadStore() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      store = { ...store, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to load local DB store file, starting fresh', err);
  }
  seedDefaultFacilities();
}

export function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to save DB store file', err);
  }
}

loadStore();

export const memoryDb = {
  store,
  saveStore
};

// Postgres Pool Connection (optional connection attempt)
export const pgPool = new Pool({
  connectionString: config.databaseUrl,
  idleTimeoutMillis: 5000
});

pgPool.on('error', (err) => {
  console.warn('Postgres connection warning (using in-memory fallback):', err.message);
});
