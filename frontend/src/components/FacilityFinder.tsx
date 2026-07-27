import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Star, Phone, Hospital, ExternalLink } from 'lucide-react';
import axios from 'axios';

export const FacilityFinder: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await axios.get('/api/v1/facilities');
        setFacilities(res.data.facilities);
      } catch (err) {
        console.error('Failed to fetch facilities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-clinical-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-clinical-teal" />
            <span>Nearby Hospitals & Medical Facilities</span>
          </h2>
          <p className="text-xs text-slate-500">Google Maps Places API location-based healthcare finder</p>
        </div>
        <span className="text-xs bg-teal-50 text-clinical-teal font-bold px-3 py-1 rounded border border-teal-200">
          Emergency Services 24/7
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facilities List */}
        <div className="lg:col-span-1 space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading nearby medical centers...</div>
          ) : (
            facilities.map((fac) => (
              <div
                key={fac.facility_id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-clinical-teal transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-clinical-teal shrink-0" />
                    <h3 className="font-bold text-xs text-clinical-navy">{fac.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                    <span>{fac.rating}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{fac.location?.address || 'Central District'}</span>
                </p>

                {fac.contact && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{fac.contact}</span>
                  </p>
                )}

                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Open Now
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-clinical-teal hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map View Widget */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-xl min-h-[400px] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden shadow-inner">
          <iframe
            title="Google Maps Medical Facilities"
            className="absolute inset-0 w-full h-full border-0 opacity-80"
            loading="lazy"
            src="https://maps.google.com/maps?q=hospitals+near+me&t=&z=13&ie=UTF8&iwloc=&output=embed"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
