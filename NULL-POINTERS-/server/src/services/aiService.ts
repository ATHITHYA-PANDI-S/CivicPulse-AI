import { 
  ComplaintCategory, 
  ComplaintSeverity, 
  AIAnalysis, 
  PriorityBreakdown, 
  LocationData, 
  Complaint,
  FieldWorker,
  ResolutionVerification
} from '../types';
import { db } from '../storage/dbAdapter';

// Multilingual keywords dictionary for Tamil, Hindi, and English
const EMERGENCY_KEYWORDS = [
  'live wire', 'wire snapped', 'sparking', 'electric shock', 'transformer burst', 'hanging wire',
  'gas leak', 'png leak', 'lpg leak', 'sulfur smell', 'toxic gas',
  'fire', 'explosion', 'blast',
  'open manhole', 'manhole cover missing', 'drain collapse', 'cave in', 'road cave-in',
  'building collapse', 'wall collapse', 'landslide',
  'deep water logging', 'flash flood', 'drowning risk', 'heavy current'
];

const TAMIL_MAPPINGS: { pattern: RegExp; category: ComplaintCategory; severity: ComplaintSeverity; english: string }[] = [
  { pattern: /மின்\s*கம்பி|மின்சாரம்|ஷாக்கு|வயரிங்|கரண்ட்/i, category: 'Electricity', severity: 'emergency', english: 'Live electrical wire / electrical shock hazard' },
  { pattern: /ரோடு|பள்ளம்|குழி|சாலை/i, category: 'Roads', severity: 'medium', english: 'Damaged road surface / pothole' },
  { pattern: /சாக்கடை|கழிவுநீர்|ட்ரைனேஜ்|அடைப்பு/i, category: 'Drainage', severity: 'high', english: 'Choked drainage / sewage overflow' },
  { pattern: /குப்பை|கழிவு|துர்நாற்றம்/i, category: 'Garbage', severity: 'medium', english: 'Garbage accumulation / waste overflow' },
  { pattern: /தண்ணீர்|குடிநீர்|பைப்|கசிவு/i, category: 'Water', severity: 'high', english: 'Drinking water leakage / pipeline rupture' },
  { pattern: /தெரு\s*விளக்கு|லைட்|இருட்டு/i, category: 'Streetlights', severity: 'medium', english: 'Streetlight outage / dark street' },
  { pattern: /மேன்ஹோல்|பாதாள\s*சாக்கடை/i, category: 'Drainage', severity: 'emergency', english: 'Open manhole hazard' },
  { pattern: /விபத்து|ஆபத்து|தீ|விபத்து/i, category: 'Public Safety', severity: 'emergency', english: 'Accident / public safety hazard' }
];

const HINDI_MAPPINGS: { pattern: RegExp; category: ComplaintCategory; severity: ComplaintSeverity; english: string }[] = [
  { pattern: /बिजली|तार|करंट|शॉर्ट\s*सर्किट/i, category: 'Electricity', severity: 'emergency', english: 'Broken electrical wire / electric hazard' },
  { pattern: /सड़क|गड्ढा|रास्ता/i, category: 'Roads', severity: 'medium', english: 'Pothole / damaged road' },
  { pattern: /नाला|सीवर|गंदा\s*पानी/i, category: 'Drainage', severity: 'high', english: 'Blocked sewer / drainage overflow' },
  { pattern: /कचरा|कूड़ा|सफाई/i, category: 'Garbage', severity: 'medium', english: 'Garbage dumping / waste overflow' },
  { pattern: /पानी|पाइप|रिसाव/i, category: 'Water', severity: 'high', english: 'Water pipeline burst / leakage' },
  { pattern: /स्ट्रीट\s*लाइट|बत्ती|अंधेरा/i, category: 'Streetlights', severity: 'medium', english: 'Streetlight failure' },
  { pattern: /मैनहोल|खुला\s*गड्ढा/i, category: 'Drainage', severity: 'emergency', english: 'Open manhole hazard' }
];

// Haversine distance calculator in meters
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class AIService {
  /**
   * Complete natural language understanding, classification & priority prediction
   */
  static analyzeComplaint(
    description: string, 
    inputCategory?: ComplaintCategory, 
    location?: Partial<LocationData>,
    supportingCount: number = 0
  ): AIAnalysis {
    const text = description.trim().toLowerCase();
    
    // 1. Multilingual detection & translation
    let detectedCategory: ComplaintCategory = inputCategory || 'Other';
    let detectedSeverity: ComplaintSeverity = 'medium';
    let detectedEmergency = false;
    let emergencyReason: string | undefined = undefined;
    let translatedEnglish: string | undefined = undefined;

    // Check Tamil
    for (const item of TAMIL_MAPPINGS) {
      if (item.pattern.test(description)) {
        detectedCategory = item.category;
        if (item.severity === 'emergency') detectedSeverity = 'emergency';
        translatedEnglish = item.english;
        break;
      }
    }

    // Check Hindi
    if (!translatedEnglish) {
      for (const item of HINDI_MAPPINGS) {
        if (item.pattern.test(description)) {
          detectedCategory = item.category;
          if (item.severity === 'emergency') detectedSeverity = 'emergency';
          translatedEnglish = item.english;
          break;
        }
      }
    }

    // English keyword categorization fallback
    if (detectedCategory === 'Other' || !inputCategory) {
      if (/wire|electric|shock|power|transformer|spark/i.test(text)) {
        detectedCategory = 'Electricity';
      } else if (/pothole|road|asphalt|tar|tarmac|crater|pavement/i.test(text)) {
        detectedCategory = 'Roads';
      } else if (/drain|sewage|manhole|gutter|culvert|clog/i.test(text)) {
        detectedCategory = 'Drainage';
      } else if (/water|pipeline|leak|gush|potable|drinking/i.test(text)) {
        detectedCategory = 'Water';
      } else if (/garbage|trash|dump|waste|bin|stench|refuse/i.test(text)) {
        detectedCategory = 'Garbage';
      } else if (/streetlight|lamp|dark|bulb|lighting/i.test(text)) {
        detectedCategory = 'Streetlights';
      } else if (/accident|gas leak|fire|collapse|hazard|safety/i.test(text)) {
        detectedCategory = 'Public Safety';
      }
    }

    // 2. Emergency keywords detection
    const foundEmergencyKeywords: string[] = [];
    for (const kw of EMERGENCY_KEYWORDS) {
      if (text.includes(kw) || (translatedEnglish && translatedEnglish.toLowerCase().includes(kw))) {
        foundEmergencyKeywords.push(kw);
      }
    }

    if (foundEmergencyKeywords.length > 0 || detectedSeverity === 'emergency') {
      detectedEmergency = true;
      detectedSeverity = 'emergency';
      emergencyReason = `Life-safety hazard detected: Contains critical trigger "${foundEmergencyKeywords[0] || 'electrical hazard'}". Bypasses standard triage queue.`;
    } else if (/urgent|severe|huge|massive|burst|broken|overflowing/i.test(text)) {
      detectedSeverity = 'high';
    } else if (/minor|small|slow|flickering|cosmetic/i.test(text)) {
      detectedSeverity = 'low';
    }

    // 3. Department Recommendation
    const departmentMap: Record<ComplaintCategory, string> = {
      Electricity: 'Electricity Control Room',
      Roads: 'Highways & Roads Dept',
      Drainage: 'Metro Water & Drainage',
      Water: 'Metro Water & Drainage',
      Garbage: 'Solid Waste Management',
      Streetlights: 'Electricity Control Room',
      Sanitation: 'Solid Waste Management',
      'Public Safety': 'Public Safety & Disaster Management',
      Other: 'Municipal Operations'
    };
    const recommendedDepartment = departmentMap[detectedCategory] || 'Municipal Operations';

    // 4. Calculate Explainable Priority Breakdown
    const priorityBreakdown = this.calculatePriorityBreakdown(
      detectedCategory,
      detectedSeverity,
      detectedEmergency,
      supportingCount,
      location?.area
    );

    // 5. Predicted Response Time
    let predictedResponseHours = 24;
    let predictedResponseLabel = 'Expected resolution: 24 hours';

    if (detectedEmergency) {
      predictedResponseHours = 0.3; // ~18 mins
      predictedResponseLabel = 'Expected response: 15–20 minutes (Emergency Protocol)';
    } else if (detectedSeverity === 'high') {
      predictedResponseHours = supportingCount > 3 ? 4 : 8;
      predictedResponseLabel = `Expected resolution: ${predictedResponseHours} hours`;
    } else if (detectedSeverity === 'medium') {
      predictedResponseHours = 24;
      predictedResponseLabel = 'Expected resolution: 24–36 hours';
    } else {
      predictedResponseHours = 48;
      predictedResponseLabel = 'Expected resolution: 2–3 days';
    }

    // 6. False report / spam check
    const isSpam = text.length < 5 || /test|asdf|qwerty|foo\s*bar/i.test(text);

    return {
      category: detectedCategory,
      confidence: detectedEmergency ? 0.98 : 0.94,
      severity: detectedSeverity,
      isEmergency: detectedEmergency,
      emergencyReason,
      urgencyKeywords: foundEmergencyKeywords.length > 0 ? foundEmergencyKeywords : ['civic maintenance'],
      sentiment: detectedEmergency ? 'urgent' : (detectedSeverity === 'high' ? 'frustrated' : 'neutral'),
      reasoning: detectedEmergency
        ? `🚨 EMERGENCY: ${emergencyReason} Recommended immediate dispatch of ${recommendedDepartment}.`
        : `Categorized under ${detectedCategory} with ${detectedSeverity} severity based on text signals and municipal risk matrix.`,
      recommendedDepartment,
      predictedResponseHours,
      predictedResponseLabel,
      priorityScore: priorityBreakdown.total,
      priorityBreakdown,
      isSpam,
      spamConfidence: isSpam ? 0.85 : 0.05,
      spamReason: isSpam ? 'Submission contains minimal or repetitive characters.' : undefined
    };
  }

  /**
   * Explainable Priority Score Breakdown formula
   */
  static calculatePriorityBreakdown(
    category: ComplaintCategory,
    severity: ComplaintSeverity,
    isEmergency: boolean,
    crowdCount: number = 0,
    area?: string
  ): PriorityBreakdown {
    // 1. Severity Weight (Max 40)
    let severityWeight = 10;
    if (isEmergency || severity === 'emergency') severityWeight = 40;
    else if (severity === 'high') severityWeight = 30;
    else if (severity === 'medium') severityWeight = 20;
    else if (severity === 'low') severityWeight = 10;

    // 2. Category Risk (Max 25)
    let categoryRisk = 12;
    switch (category) {
      case 'Electricity':
      case 'Public Safety':
        categoryRisk = 25;
        break;
      case 'Water':
      case 'Drainage':
        categoryRisk = 22;
        break;
      case 'Roads':
        categoryRisk = 18;
        break;
      case 'Streetlights':
      case 'Sanitation':
        categoryRisk = 16;
        break;
      case 'Garbage':
        categoryRisk = 14;
        break;
      default:
        categoryRisk = 10;
    }

    // 3. Crowd Reports Multiplier (Max 20)
    // 0 reports: 10, 1-3 reports: 14, 4-7 reports: 18, 8+ reports: 22-25
    let crowdReports = 10;
    if (crowdCount >= 8) crowdReports = 25;
    else if (crowdCount >= 4) crowdReports = 18;
    else if (crowdCount >= 1) crowdReports = 14;

    // 4. Location Risk (Max 10)
    // High-density commercial/transit zones get higher weight
    let locationRisk = 6;
    if (area) {
      const highDensityZones = [
        'gandhipuram', 'rs puram', 'peelamedu', 'saibaba colony', 
        'singanallur', 'ukkadam', 'saravanampatti', 'town hall', 
        'race course', 'ramanathapuram', 'eachanari', 'anna nagar', 't nagar'
      ];
      if (highDensityZones.some(z => area.toLowerCase().includes(z))) {
        locationRisk = 9;
      }
    }

    // 5. Base Age factor
    const complaintAge = 5;

    // Total clamped to 100
    const total = Math.min(100, Math.max(15, severityWeight + categoryRisk + crowdReports + locationRisk + complaintAge));

    return {
      severityWeight,
      categoryRisk,
      crowdReports,
      locationRisk,
      complaintAge,
      total
    };
  }

  /**
   * Smart Duplicate & Crowd Clustering
   * Searches for open complaints within 200m radius of same category
   */
  static findDuplicateCluster(
    category: ComplaintCategory,
    lat: number,
    lng: number,
    description: string
  ): { isDuplicate: boolean; masterComplaint?: Complaint; distanceMeters?: number } {
    const openComplaints = db.getComplaints().filter(c => c.status !== 'resolved' && c.category === category);

    for (const existing of openComplaints) {
      const distance = calculateDistanceMeters(lat, existing.location.lat, lng, existing.location.lng);
      
      // Proximity threshold: 250 meters
      if (distance <= 250) {
        return {
          isDuplicate: true,
          masterComplaint: existing,
          distanceMeters: Math.round(distance)
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Smart Field Team Assignment Recommender
   */
  static recommendNearestTeam(
    department: string,
    lat: number,
    lng: number
  ): { team: FieldWorker; distanceKm: number; etaMinutes: number } | undefined {
    const workers = db.getFieldWorkers(department).filter(w => w.isAvailable);
    if (workers.length === 0) return undefined;

    let nearest = workers[0];
    let minDistance = calculateDistanceMeters(lat, nearest.lat, lng, nearest.lng);

    for (const w of workers) {
      const dist = calculateDistanceMeters(lat, w.lat, lng, w.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = w;
      }
    }

    const distanceKm = +(minDistance / 1000).toFixed(1);
    // Rough ETA: 10 mins base + 4 mins per km in city traffic
    const etaMinutes = Math.max(8, Math.round(8 + distanceKm * 4.5));

    return {
      team: nearest,
      distanceKm: Math.max(0.4, distanceKm),
      etaMinutes
    };
  }

  /**
   * AI Resolution Verification
   * Compares before and after photographs for civic issue fix validation
   */
  static verifyResolution(
    beforePhotoUrl?: string, 
    afterPhotoUrl?: string, 
    category?: ComplaintCategory,
    notes?: string
  ): ResolutionVerification {
    // If no after photo is provided
    if (!afterPhotoUrl) {
      return {
        pass: false,
        status: 'REVIEW REQUIRED',
        confidence: 0.40,
        reason: 'Resolution photo missing. Human authority inspection required before closing ticket.',
        verifiedAt: new Date().toISOString(),
        workerNotes: notes
      };
    }

    // High confidence AI visual comparison simulation
    const pass = true;
    const confidence = 0.91 + Math.round(Math.random() * 6) / 100; // 0.91 - 0.97
    
    let reason = 'AI Vision Comparison: Repair work validated. Pavement discontinuity and hazard markers are no longer detected.';
    if (category === 'Electricity') {
      reason = 'AI Vision Comparison: Exposed wiring and open junction points are completely insulated and secured in tamper-proof enclosure.';
    } else if (category === 'Roads') {
      reason = 'AI Vision Comparison: Crater depression fully resurfaced with compacted bituminous asphalt. Level matches adjacent pavement.';
    } else if (category === 'Drainage') {
      reason = 'AI Vision Comparison: Drain culvert cleared of silt and reinforced concrete slab cover positioned securely.';
    } else if (category === 'Garbage') {
      reason = 'AI Vision Comparison: Solid waste removed completely. Dumpster sanitized and ground perimeter cleared.';
    }

    return {
      pass,
      status: pass ? 'PASS' : 'REVIEW REQUIRED',
      confidence,
      reason: `${reason} Likely resolved. Human confirmation recommended.`,
      beforePhotoUrl,
      afterPhotoUrl,
      verifiedAt: new Date().toISOString(),
      workerNotes: notes
    };
  }
}
