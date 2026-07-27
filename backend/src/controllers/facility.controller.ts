import { Request, Response } from 'express';
import { config } from '../config/env';
import { memoryDb } from '../db';

export async function getNearbyFacilities(req: Request, res: Response) {
  try {
    const latStr = req.query.lat as string;
    const lngStr = req.query.lng as string;
    
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (config.googleMapsApiKey) {
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
          console.warn('Google Maps API fetch failed:', err?.message);
        }
      } else {
        // Fallback to Free Nominatim OSM API for real hospitals
        try {
          const minLon = lng - 0.05;
          const maxLon = lng + 0.05;
          const minLat = lat - 0.05;
          const maxLat = lat + 0.05;
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=5&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`;
          
          const response = await fetch(nominatimUrl, { headers: { 'User-Agent': 'DocShaab App' }});
          const data: any = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const facilities = data.map((place: any) => ({
              facility_id: place.place_id.toString(),
              name: place.name || 'Local Hospital',
              facility_type: 'Hospital',
              location: {
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
                address: place.display_name.split(',').slice(0, 3).join(',')
              },
              rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1), // Mock rating
              open_now: true
            }));
            return res.json({ facilities });
          }
        } catch (err: any) {
          console.warn('Nominatim API fetch failed:', err?.message);
        }
      }
    }

    // Return stored/seeded medical facilities as absolute fallback
    return res.json({
      facilities: memoryDb.store.medicalFacilities
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch medical facilities' });
  }
}
