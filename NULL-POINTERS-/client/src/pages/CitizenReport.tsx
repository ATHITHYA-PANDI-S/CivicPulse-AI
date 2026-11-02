import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Flame,
  Bot,
  Navigation,
  Mic
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ComplaintCategory, AIAnalysis } from '../types';
import { AIPreviewCard } from '../components/citizen/AIPreviewCard';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import { CameraPhotoUploader } from '../components/common/CameraPhotoUploader';
import { VoiceInputModal } from '../components/common/VoiceInputModal';

const CATEGORIES: ComplaintCategory[] = [
  'Roads',
  'Electricity',
  'Water',
  'Drainage',
  'Garbage',
  'Streetlights',
  'Sanitation',
  'Public Safety',
  'Other'
];

export const COIMBATORE_LOCATIONS: { name: string; zone: string; lat: number; lng: number }[] = [
  { name: 'Gandhipuram', zone: 'Central Zone, Ward 45', lat: 11.0168, lng: 76.9558 },
  { name: 'RS Puram', zone: 'West Zone, Ward 23', lat: 11.0089, lng: 76.9458 },
  { name: 'Peelamedu / Hopes College', zone: 'East Zone, Ward 54', lat: 11.0287, lng: 77.0125 },
  { name: 'Saibaba Colony', zone: 'North Zone, Ward 18', lat: 11.0267, lng: 76.9436 },
  { name: 'Saravanampatti (IT Corridor)', zone: 'North Zone, Ward 12', lat: 11.0805, lng: 76.9944 },
  { name: 'Singanallur', zone: 'East Zone, Ward 60', lat: 11.0016, lng: 77.0258 },
  { name: 'Ukkadam', zone: 'South Zone, Ward 72', lat: 10.9904, lng: 76.9602 },
  { name: 'Ramanathapuram', zone: 'Central-East, Ward 49', lat: 10.9984, lng: 76.9856 },
  { name: 'Race Course', zone: 'Central Elite, Ward 40', lat: 11.0033, lng: 76.9744 },
  { name: 'Town Hall / Big Bazaar', zone: 'Central Market, Ward 42', lat: 10.9972, lng: 76.9614 },
  { name: 'Ganapathy', zone: 'North-East Zone, Ward 15', lat: 11.0375, lng: 76.9786 },
  { name: 'Thudiyalur', zone: 'North Suburb, Ward 08', lat: 11.0772, lng: 76.9425 },
  { name: 'Vadavalli', zone: 'West Suburb, Ward 36', lat: 11.0233, lng: 76.9014 },
  { name: 'Kovaipudur', zone: 'South-West, Ward 85', lat: 10.9425, lng: 76.9386 },
  { name: 'Sundarapuram', zone: 'South Zone, Ward 88', lat: 10.9467, lng: 76.9814 },
  { name: 'Kuniyamuthur', zone: 'South-West, Ward 82', lat: 10.9633, lng: 76.9525 },
  { name: 'Perur', zone: 'West Cultural, Ward 38', lat: 10.9733, lng: 76.9186 },
  { name: 'PN Pudur', zone: 'West Zone, Ward 28', lat: 11.0189, lng: 76.9247 },
  { name: 'Ondipudur', zone: 'East Suburb, Ward 64', lat: 11.0006, lng: 77.0544 },
  { name: 'Sulur', zone: 'East Division, Ward 95', lat: 11.0267, lng: 77.1264 },
  { name: 'Podanur', zone: 'Railway Hub, Ward 78', lat: 10.9667, lng: 76.9986 },
  { name: 'Eachanari', zone: 'Industrial Corridor, Ward 90', lat: 10.9233, lng: 76.9786 },
  { name: 'Kalapatti (Airport Zone)', zone: 'North-East, Ward 10', lat: 11.0667, lng: 77.0425 },
  { name: 'Chinnavedampatti', zone: 'North Corridor, Ward 14', lat: 11.0633, lng: 76.9814 },
  { name: 'Kurichi', zone: 'South Industrial, Ward 86', lat: 10.9386, lng: 76.9667 }
];

export const CitizenReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createComplaint } = useComplaints();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [address, setAddress] = useState('Cross Cut Road, 7th Street Corner, Gandhipuram');
  const [area, setArea] = useState('Gandhipuram');
  const [lat, setLat] = useState(11.0168);
  const [lng, setLng] = useState(76.9558);
  const [photos, setPhotos] = useState<string[]>([]);
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || '+91 98401 23456');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'ta' | 'hi'>('ta');

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When area dropdown is changed, automatically update coordinates & address
  const handleAreaChange = (selectedName: string) => {
    setArea(selectedName);
    const loc = COIMBATORE_LOCATIONS.find(l => l.name === selectedName);
    if (loc) {
      setLat(loc.lat);
      setLng(loc.lng);
      setAddress(`Main Road / Central Junction, ${loc.name}, Coimbatore`);
    }
  };

  // When map pin is clicked/dropped, update accurate coordinates
  const handleMapLocationSelect = (newLat: number, newLng: number, approx?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (approx) {
      setAddress(approx);
    } else {
      setAddress(`Pinned GPS Location (${newLat.toFixed(4)}, ${newLng.toFixed(4)}), ${area}, Coimbatore`);
    }
  };

  // Debounced live AI analysis on description change
  useEffect(() => {
    if (!description.trim() || description.length < 8) {
      setAiAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await api.analyzeText(description, category, { address, area, city: 'Coimbatore', lat, lng });
        setAiAnalysis(res.analysis);
        if (res.analysis.category && CATEGORIES.includes(res.analysis.category as any)) {
          setCategory(res.analysis.category as ComplaintCategory);
        }
      } catch (err) {
        console.error('AI preview failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description, area, lat, lng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createComplaint({
        description,
        category,
        location: {
          address,
          area,
          city: 'Coimbatore',
          lat,
          lng
        },
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'],
        citizenId: user?.id || 'usr-citizen-1',
        citizenName: user?.name || 'Arun Kumar',
        citizenPhone
      });

      if (res.isDuplicateGrouped && res.masterComplaint) {
        navigate(`/citizen/complaints/${res.masterComplaint.id}`);
      } else {
        navigate(`/citizen/complaints/${res.complaint.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Subtitle */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-civic-700 dark:text-civic-300 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          AI-Powered Grievance Intake Engine • Coimbatore City
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Report a Civic Problem in Coimbatore
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Our AI instantly detects life safety hazards, pinpoints exact map GPS coordinates, and assigns field squads.
        </p>
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* 1. Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Issue Description *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs group"
                title="Speak description with Live Microphone"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>Voice Dictate ({voiceLanguage === 'ta' ? 'தமிழ்' : voiceLanguage === 'hi' ? 'हिन्दी' : 'English'})</span>
              </button>
              {isAnalyzing && (
                <span className="inline-flex items-center text-[11px] text-civic-600 font-semibold animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> AI analyzing text...
                </span>
              )}
            </div>
          </div>
          <textarea
            rows={4}
            required
            placeholder="Describe the issue in detail... (e.g. Live electrical wire sparking, or deep pothole on main road)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-civic-500 transition"
          />
        </div>

        {/* Real-time AI Analysis Card if text available */}
        {aiAnalysis && (
          <AIPreviewCard analysis={aiAnalysis} isLoading={isAnalyzing} />
        )}

        {/* 2. Category Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  category === cat
                    ? 'bg-civic-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ACCURATE MAP PINPOINT LOCATION PICKER & ALL COIMBATORE WARDS */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              3. Accurate Location & GPS Pinpoint (Coimbatore)
            </label>
            <span className="text-[11px] text-civic-600 font-bold">25+ Wards Supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Coimbatore Ward / Locality:
              </label>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                {COIMBATORE_LOCATIONS.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Street Address / Landmark:
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Cross Cut Road, 7th Street Corner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Interactive Map Component */}
          <LocationPickerMap
            lat={lat}
            lng={lng}
            onLocationSelect={handleMapLocationSelect}
            height="260px"
          />
        </div>

        {/* 4. Live Camera & Photo Evidence Upload */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <CameraPhotoUploader
            photos={photos}
            onChange={setPhotos}
            maxPhotos={4}
            categoryHint={category}
            label="4. Photo Evidence & Live Camera Snapshot"
          />
        </div>

        {/* 5. Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reporter Citizen:
            </label>
            <input
              type="text"
              disabled
              value={user?.name || 'Arun Kumar'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone (for SMS updates):
            </label>
            <input
              type="tel"
              value={citizenPhone}
              onChange={(e) => setCitizenPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/citizen/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="px-6 py-2.5 rounded-xl bg-civic-600 hover:bg-civic-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-civic-600/30 transition transform active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting & Triaging...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Citizen Grievance
              </>
            )}
          </button>
        </div>

      </form>

      {/* Voice Recognition Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(text) => {
          setDescription(prev => prev ? `${prev} ${text}` : text);
        }}
        language={voiceLanguage}
        onLanguageChange={setVoiceLanguage}
      />

    </div>
  );
};
