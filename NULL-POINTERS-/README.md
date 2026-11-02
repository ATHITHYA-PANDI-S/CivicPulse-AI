# 🏛️ CivicPulse AI — Coimbatore Municipal Grievance & Field Operations Portal

> **AI-Driven Civic Issue Redressal, High-Precision GPS Pinpoint Mapping, Dynamic Squad Dispatch & AI Vision Verification for Coimbatore City Municipal Corporation (CCMC)**

---

## 📌 Overview

**CivicPulse AI** is a comprehensive, production-ready civic issue redressal and emergency response management platform built for **Coimbatore Smart City**. It bridges the gap between citizens, field repair squads, and municipal administrators through real-time AI triage, multi-language voice assistance (Tamil, Hindi, English), interactive Leaflet GPS mapping, dynamic team re-assignment, and automated computer vision repair verification.

---

## 🌟 3 Dedicated Roles & Workflows

```
                                  🌐 LANDING GATEWAY: http://localhost:5173
                                                     │
                   ┌─────────────────────────────────┼─────────────────────────────────┐
                   ▼                                 ▼                                 ▼
         👤 1. CITIZEN (USER)              🛡️ 2. AUTHORITATIVE (SQUAD)         🏛️ 3. ADMIN (COMMISSIONER)
        "Give Civic Complaint"                  "Do Field Work"                   "Monitor & Dispatch"
  • Mail ID & Custom Location           • Accept assigned work orders        • City-wide complaint monitoring
  • 25+ Coimbatore Wards                • Change team & modify squad plan    • Emergency hazard triage
  • Interactive GPS Pinpoint Map        • Start on-site physical repair      • Dispatch squads with GPS & ETA
  • Live AI severity & category preview • Upload repair photo proof          • SLA analytics & compliance index
  • Tamil/Hindi/English Voice Bot       • AI Vision verification (PASS 92%)  • Predictive chronic flood zones
  • 6-stage lifecycle tracking          • Complete & close work orders       • Automated citizen notification
```

---

## ✨ Key Features

### 👤 1. Citizen Resident Experience
- **Flexible Location Setup on Login**: Choose from 25+ Coimbatore Wards, type custom residential street/door numbers, auto-detect device GPS, or pinpoint on an interactive map.
- **Accurate GPS Pinpoint Map**: Interactive Leaflet map with draggable marker pin and autocomplete search for major Coimbatore landmarks (*Cross Cut Road, DB Road, 100 Feet Road, Tidel Park, Avinashi Road, etc.*).
- **Real-Time AI Intake Diagnosis**: Instant hazard detection, severity classification, and automatic category routing as the user types.
- **Multilingual AI Voice Assistant**: Full speech recognition and text-to-speech support in **Tamil (தமிழ்)**, **Hindi (हिंदी)**, and **English**.
- **Geospatial Duplicate Clustering**: Groups nearby complaints into a single Master Ticket using the Haversine formula within a 50m radius.

### 🛡️ 2. Authoritative Field Squad Execution Desk
- **Clickable Step-by-Step Progress Stepper**: Advance through operational milestones with 1-click action buttons:
  - `Step 1: Intake & Verify` $\to$ Confirm hazard
  - `Step 2: Squad Assigned` $\to$ Dispatched nearest crew
  - `Step 3: En Route` $\to$ Mark arrived on-site
  - `Step 4: Physical Repair` $\to$ Active on-site repair work
  - `Step 5: AI Verified Resolved` $\to$ Photo proof match
- **Dynamic Team Re-Assignment**: Modify the assigned squad, change response plans, or re-route tasks on the fly.
- **AI Computer Vision Verification**: Compares the original citizen damage photo with the on-site repair photo to calculate visual similarity and issue an automated **PASS (92%+)** verification certificate.

### 🏛️ 3. Municipal Administrator Monitoring Console (CCMC)
- **Executive KPI Dashboard**: Live tracking of open complaints, verified emergencies, average resolution turnaround, and global SLA compliance.
- **GIS City Map Telemetry**: Real-time visualization of all grievance pins across Coimbatore color-coded by severity.
- **Predictive Risk & Chronic Weather Intelligence**: AI predictive flood and infrastructure risk modeling with meteorological radar simulation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet GIS, React-Leaflet, Recharts.
- **Backend**: Node.js, Express.js, TypeScript, RESTful API architecture.
- **Database**: Zero-setup file-based persistence (`server/data/db.json`) with auto-seeding.
- **AI Engines**:
  - Natural Language Processing triage & severity weighting
  - Multilingual voice synthesis & speech-to-text
  - Haversine geospatial proximity clustering
  - Computer Vision visual difference & repair confidence comparator

---

## 🚀 Quick Start Guide (Step-by-Step)

### 📋 Prerequisites
- **Node.js** v18.0.0 or higher installed ([Download Node.js](https://nodejs.org/))
- **npm** (comes with Node.js)
- **VS Code** (or your favorite IDE)

---

### 📦 Step 1: Open the Project in VS Code
1. Extract the downloaded `citizen-ai-portal.zip` archive.
2. Open **VS Code** $\to$ Click `File` $\to$ `Open Folder...` $\to$ Select the extracted `citizen-ai-portal` folder.

---

### ⚙️ Step 2: Install Dependencies

Open a terminal in VS Code (`Ctrl + ~` or `Terminal` $\to$ `New Terminal`):

#### 1. Backend Server Setup:
```powershell
cd server
npm install
npm run build
```

#### 2. Frontend Client Setup:
```powershell
cd ../client
npm install
```

---

### ▶️ Step 3: Run the Application

You can run both backend and frontend concurrently in two terminal tabs:

#### Terminal 1 (Backend Server):
```powershell
cd server
npm run dev
```
> 🚀 Backend starts at: **`http://localhost:5000`**

#### Terminal 2 (Frontend Client):
```powershell
cd client
npm run dev
```
> 🌐 Frontend starts at: **`http://localhost:5173`**

---

## 🔑 Demo Access Credentials (1-Click Login)

| Role | Default Name | Email / Office | Purpose |
| :--- | :--- | :--- | :--- |
| **👤 Citizen** | Arun Kumar | `arun.coimbatore@gmail.com` | Report civic problems & track resolution |
| **🛡️ Authoritative Squad** | Officer Sundaram K. | `Electricity Control Room (TNEB-CR Coimbatore)` | Execute field repairs & upload AI proof |
| **🏛️ Municipal Admin** | Chief Commissioner Priya R. | `Coimbatore City Municipal Corporation (CCMC)` | City-wide monitoring & squad dispatch |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/complaints` | Fetch all complaints with status/category/area filters |
| `GET` | `/api/complaints/:id` | Fetch detailed complaint timeline, telemetry & photo evidence |
| `POST` | `/api/complaints` | Submit new grievance with live AI triage and duplicate check |
| `PATCH` | `/api/complaints/:id/status` | Update complaint status (`assigned`, `in_progress`, `resolved`) |
| `POST` | `/api/complaints/:id/assign` | Assign/Re-assign field squad and calculate GPS ETA |
| `POST` | `/api/complaints/:id/resolve` | Submit after-repair photo and run AI computer vision match |
| `POST` | `/api/complaints/:id/verify-emergency` | Verify life safety hazard report |
| `POST` | `/api/ai/analyze` | Real-time NLP complaint text analysis & severity scoring |
| `POST` | `/api/ai/verify-resolution` | AI photo comparator verification |
| `GET` | `/api/dashboard/stats` | Executive KPI analytics and SLA compliance index |
| `GET` | `/api/risk-zones` | Predictive flood risk zones and historical weather metrics |
| `GET` | `/api/teams` | List municipal departments and field squads |
| `GET` | `/api/notifications` | Fetch role-targeted notifications |

---

## 📂 Project Directory Structure

```
citizen-ai-portal/
├── client/                          # React + TypeScript + Vite Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── authority/           # DispatchModal, ResolutionModal, EmergencyQueue
│   │   │   ├── citizen/             # AIPreviewCard, ComplaintCard
│   │   │   ├── common/              # Navbar, Footer, DemoBar, StatusBadge, ProcessWorkflowStepper
│   │   │   └── map/                 # LocationPickerMap, ExactLocationMap, LeafletComplaintMap
│   │   ├── context/                 # AuthContext, ComplaintContext, NotificationContext, ThemeContext
│   │   ├── pages/                   # Login, CitizenDashboard, CitizenReport, CitizenChatbot, AuthorityDashboard, AdminDashboard...
│   │   ├── services/                # api.ts (HTTP client)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx                  # Protected Route Guard & role routing
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                          # Express + TypeScript Backend
│   ├── data/
│   │   └── db.json                  # JSON Database
│   ├── src/
│   │   ├── controllers/             # complaintController, aiController, authController, dashboardController...
│   │   ├── routes/                  # api.ts
│   │   ├── services/                # aiService.ts (Triage, Duplicate Clustering, Vision Comparator)
│   │   ├── storage/                 # dbAdapter.ts (CRUD helpers)
│   │   ├── utils/                   # seedData.ts (Demo database seeder)
│   │   └── server.ts                # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                        # Documentation & Instructions
```

---

## 🏆 Hackathon Highlights
- **100% Functional End-to-End**: Zero mock errors, fully working REST backend and responsive frontend.
- **Zero-Setup Database**: No external database configuration required; automatic initial data seeding.
- **Smart City Ready**: Configured for Coimbatore City Municipal Corporation with 25+ real localities and GPS coordinates.
- **Inclusive & Accessible**: Voice interaction in regional Tamil, Hindi, and English for all citizens.

---

## 📄 License
This project is licensed under the MIT License.
