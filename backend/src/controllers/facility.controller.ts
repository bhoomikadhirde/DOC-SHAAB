import { Request, Response } from 'express';
import { config } from '../config/env';
import { memoryDb } from '../db';

export async function getNearbyFacilities(req: Request, res: Response) {
  try {
    const { lat, lng, query } = req.query;

    if (config.googleMapsApiKey && lat && lng) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${config.googleMapsApiKey}`;
        const response = await fetch(placesUrl);
        const data: any = await response.json();

        if (data.status === 'OK' && data.results) {
          const facilities = data.results.map((place: any) => ({
            facility_id: place.place_id,
            name: place.name,
            facility_type: place.types?.includes('hospital') ? 'Hospital' : 'Medical Clinic',
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: place.vicinity
            },
            rating: place.rating || 4.5,
            open_now: place.opening_hours?.open_now ?? true
          }));
          return res.json({ facilities });
        }
      } catch (err: any) {
        console.warn('Google Maps API fetch fallback to DB:', err?.message);
      }
    }

    // Return stored/seeded medical facilities
    return res.json({
      facilities: memoryDb.store.medicalFacilities
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch medical facilities' });
  }
}
