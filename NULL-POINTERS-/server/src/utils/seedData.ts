import { 
  User, 
  Complaint, 
  Department, 
  FieldWorker, 
  RiskZone, 
  NotificationItem 
} from '../types';

export const initialData: {
  users: User[];
  complaints: Complaint[];
  departments: Department[];
  fieldWorkers: FieldWorker[];
  riskZones: RiskZone[];
  notifications: NotificationItem[];
} = {
  users: [
    {
      id: 'usr-citizen-1',
      name: 'Arun Kumar',
      email: 'citizen@civicpulse.org',
      role: 'citizen',
      phone: '+91 98401 23456',
      zone: 'Central Zone',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-citizen-2',
      name: 'Lakshmi Narayanan',
      email: 'lakshmi@example.com',
      role: 'citizen',
      phone: '+91 98402 34567',
      zone: 'South Zone'
    },
    {
      id: 'usr-citizen-3',
      name: 'Karthik Raja',
      email: 'karthik@example.com',
      role: 'citizen',
      phone: '+91 98403 45678',
      zone: 'North Zone'
    },
    {
      id: 'usr-auth-1',
      name: 'Officer Sundaram K.',
      email: 'authority@civicpulse.org',
      role: 'authority',
      department: 'Electricity Control Room',
      zone: 'Central Zone',
      phone: '+91 94440 11223',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-auth-2',
      name: 'Dr. Meenakshi S.',
      email: 'roads.officer@civicpulse.org',
      role: 'authority',
      department: 'Highways & Roads Dept',
      zone: 'North Zone',
      phone: '+91 94440 22334'
    },
    {
      id: 'usr-worker-demo',
      name: 'Officer Sundaram K. (Field Worker Lead)',
      email: 'worker@civicpulse.org',
      role: 'authority',
      department: 'Electricity Control Room (TNEB-CR Coimbatore)',
      zone: 'Central Zone',
      phone: '+91 94440 11223',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-user-demo',
      name: 'Arun Kumar (Citizen Resident)',
      email: 'user@civicpulse.org',
      role: 'citizen',
      phone: '+91 98401 23456',
      zone: 'Gandhipuram, Central Zone, Coimbatore',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-admin-1',
      name: 'Chief Commissioner Priya R.',
      email: 'admin@gmail.com',
      password: '$2b$10$FWO1QPaH7HgD3nIoABz.L.Eckbfc3pi845LXrH8m67/aKr2hpHFQ2',
      role: 'admin',
      department: 'Coimbatore City Municipal Corporation (CCMC)',
      phone: '+91 94440 99999',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  ],

  departments: [
    {
      id: 'dept-elec',
      name: 'Electricity Control Room',
      code: 'TNEB-CR',
      contactEmail: 'elec.control@civicpulse.gov.in',
      contactPhone: '1912',
      slaHoursNormal: 24,
      slaHoursEmergency: 1,
      activeWorkers: 18,
      headOfficer: 'Er. R. Sundaram'
    },
    {
      id: 'dept-roads',
      name: 'Highways & Roads Dept',
      code: 'PWD-ROADS',
      contactEmail: 'roads.chennai@civicpulse.gov.in',
      contactPhone: '044-25619222',
      slaHoursNormal: 48,
      slaHoursEmergency: 4,
      activeWorkers: 32,
      headOfficer: 'Dr. Meenakshi S.'
    },
    {
      id: 'dept-water',
      name: 'Metro Water & Drainage',
      code: 'CMWSSB',
      contactEmail: 'water.support@civicpulse.gov.in',
      contactPhone: '044-45674567',
      slaHoursNormal: 36,
      slaHoursEmergency: 2,
      activeWorkers: 24,
      headOfficer: 'Eng. K. Balaji'
    },
    {
      id: 'dept-waste',
      name: 'Solid Waste Management',
      code: 'GCC-SWM',
      contactEmail: 'swm.gcc@civicpulse.gov.in',
      contactPhone: '1913',
      slaHoursNormal: 24,
      slaHoursEmergency: 6,
      activeWorkers: 45,
      headOfficer: 'Smt. Kavitha M.'
    },
    {
      id: 'dept-safety',
      name: 'Public Safety & Disaster Management',
      code: 'SDRF-CIVIC',
      contactEmail: 'safety.disaster@civicpulse.gov.in',
      contactPhone: '108',
      slaHoursNormal: 12,
      slaHoursEmergency: 0.5,
      activeWorkers: 15,
      headOfficer: 'Insp. V. Ganesan'
    }
  ],

  fieldWorkers: [
    {
      id: 'fw-elec-04',
      name: 'Electrical Response Team 04 (Lead: S. Murugan)',
      teamName: 'ERT-04 Fast Response',
      department: 'Electricity Control Room',
      phone: '+91 98840 91823',
      lat: 13.0862,
      lng: 80.2125,
      area: 'Anna Nagar West',
      isAvailable: true,
      activeAssignments: 1,
      completedTasks: 142
    },
    {
      id: 'fw-elec-02',
      name: 'Substation Flying Squad 02 (Lead: J. David)',
      teamName: 'SFS-02 T Nagar',
      department: 'Electricity Control Room',
      phone: '+91 98840 76231',
      lat: 13.0425,
      lng: 80.2312,
      area: 'T Nagar',
      isAvailable: true,
      activeAssignments: 0,
      completedTasks: 89
    },
    {
      id: 'fw-roads-01',
      name: 'Road Rapid Repair Unit 01 (Lead: K. Velu)',
      teamName: 'RRU-01 Central',
      department: 'Highways & Roads Dept',
      phone: '+91 98841 23412',
      lat: 13.0841,
      lng: 80.2098,
      area: 'Anna Nagar East',
      isAvailable: true,
      activeAssignments: 2,
      completedTasks: 210
    },
    {
      id: 'fw-drain-03',
      name: 'Drainage Jet-Rodding Unit 03 (Lead: P. Selvam)',
      teamName: 'DJU-03 South',
      department: 'Metro Water & Drainage',
      phone: '+91 98842 87654',
      lat: 12.9825,
      lng: 80.2201,
      area: 'Velachery',
      isAvailable: true,
      activeAssignments: 3,
      completedTasks: 178
    },
    {
      id: 'fw-gas-01',
      name: 'Hazmat & Gas Emergency Crew (Lead: T. Ramesh)',
      teamName: 'HEC-01 South Coastal',
      department: 'Public Safety & Disaster Management',
      phone: '+91 98843 11223',
      lat: 13.0025,
      lng: 80.2580,
      area: 'Adyar',
      isAvailable: true,
      activeAssignments: 0,
      completedTasks: 64
    }
  ],

  complaints: [],

  riskZones: [
    {
      id: 'rz-velachery-drainage',
      area: 'Velachery South',
      zone: 'South Zone',
      category: 'Drainage',
      reportCount: 17,
      timeWindowDays: 30,
      trend: 'Increasing',
      riskLevel: 'Critical',
      prediction: 'High probability (89%) of severe street waterlogging & storm-drain overflow within next 48 hours based on recurring culvert blockage history and incoming 45mm rainfall forecast.',
      recommendedAction: 'Deploy heavy suction jet-rodder pumps immediately to clear Vijayanagar & 100ft bypass culverts before storm onset.',
      lat: 12.9815,
      lng: 80.2180,
      radiusMeters: 450,
      weatherCorrelation: {
        weatherCondition: 'Heavy Rainfall Warning (IMD Red Alert)',
        rainProbability: '85%',
        hazardType: 'Urban Flash Flooding & Drainage Backsurge',
        warningMessage: 'Correlated Civic Risk: 17 Drainage Complaints + 45mm Rain Forecast = Imminent Flood Hazard'
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'rz-annanagar-potholes',
      area: 'Anna Nagar West Corridor',
      zone: 'Central Zone',
      category: 'Roads',
      reportCount: 14,
      timeWindowDays: 45,
      trend: 'Increasing',
      riskLevel: 'High',
      prediction: 'Asphalt degradation rate accelerated by 40% along 2nd Avenue bus corridor. Pothole recurrence frequency is 3.2x higher than city average.',
      recommendedAction: 'Schedule complete milling and hot-mix resurfacing rather than isolated patch repairs.',
      lat: 13.0850,
      lng: 80.2101,
      radiusMeters: 600,
      weatherCorrelation: {
        weatherCondition: 'Moderate Rain Forecast',
        rainProbability: '60%',
        hazardType: 'Road Sub-base Erosion & Cave-ins',
        warningMessage: 'Sub-surface water seepage exacerbating crater formation along metro alignment.'
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'rz-guindy-lighting',
      area: 'Guindy Industrial Estate Phase 2',
      zone: 'South Zone',
      category: 'Streetlights',
      reportCount: 9,
      timeWindowDays: 20,
      trend: 'Stable',
      riskLevel: 'Medium',
      prediction: 'Phase line voltage fluctuations causing recurring LED driver burnout across 14 lamp posts.',
      recommendedAction: 'Inspect 11kV step-down transformer terminal and replace surge protection units.',
      lat: 13.0067,
      lng: 80.2025,
      radiusMeters: 350,
      lastUpdated: new Date().toISOString()
    }
  ],

  notifications: []
};
