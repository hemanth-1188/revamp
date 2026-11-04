# REWEAVE — AI Kurti Design & Tailor Platform
## Complete Technical Overview, Architecture & Technology Stack Specification

---

## 1. Executive Summary

**REWEAVE** is a modern, AI-powered bespoke fashion and tailoring platform specifically engineered for Indian ethnic wear (Kurtis, Short Kurtis, and Anarkalis). The platform bridges the traditional gap between fabric selection, fashion inspiration (Pinterest, Instagram, real-world fabrics), and the neighborhood master tailor ecosystem.

### Core Problems Solved
1. **The Tailoring Communication Gap:** Customers often possess loose fabric swatches or screenshots from social media but struggle to describe silhouettes, necklines, seam allowances, and sleeve structures to local tailors.
2. **Fabric Quantity & Cut Miscalculation:** Users often attempt complex designs with inadequate meterage (e.g., trying to cut a flared Anarkali from 1.5 meters). REWEAVE's engine computes fabric constraints, automatically flagging incompatible cuts and recommending feasible alternatives.
3. **Pre-Stitching Visualization Anxiety:** Customers cannot envision how their flat fabric piece or chosen color palette will look as a 3D draped garment. REWEAVE provides instant parametric 2D garment drafting and interactive 3D mannequin rendering.
4. **Hyperlocal Master Tailor Discovery:** Connects customers with neighborhood artisans based on garment specialization, verified reviews, pricing bands, turnaround times, and geographic proximity via interactive mapping.

---

## 2. Elaborate Technology Stack

```
+------------------------------------------------------------------------------------+
|                                    REWEAVE UI                                     |
|  React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Cormorant Garamond & Sans  |
+------------------------------------------------------------------------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
     v                                   v                                   v
+------------------------+   +------------------------+   +------------------------+
|   Interactive 3D View  |   |   Bespoke 2D Engine    |   |   Geospatial Mapping   |
|   Three.js (r186)      |   |   HTML5 Canvas 2D API  |   |   Leaflet 1.9 + OSM    |
|   Parametric Mannequin |   |   Dynamic Texture UV   |   |   Custom Pin Overlays  |
|   OrbitControls        |   |   Front & Back Vector  |   |   Bengaluru Geo Hub    |
+------------------------+   +------------------------+   +------------------------+
                                         |
                                         v
+------------------------------------------------------------------------------------+
|                            AI & Computer Vision Core                               |
|  - Deterministic K-Means Spatial Color Extraction (120px downsampled canvas)       |
|  - Indian Ethnic Color Palette Normalization (Terracotta, Haldi, Indigo, Rose...)  |
|  - Input Type Classification (Flat Fabric vs Stitched Garment vs Ambiguous)       |
|  - Pluggable Crisp AI Pattern Service Interface (with graceful heuristic fallback)  |
|  - Material & Fiber Uncertainty Engine (no hallucinated thread compositions)       |
|  - @google/genai SDK v2.4 (Gemini Multimodal API ready)                           |
+------------------------------------------------------------------------------------+
                                         |
                                         v
+------------------------------------------------------------------------------------+
|                         State & Workflow Management                                |
|  - React Context API (AppContext) with LocalStorage persistence                   |
|  - 7-Stage Tailor Lifecycle State Machine                                          |
|  - Custom Responsive Hash/State Routing System                                    |
|  - Simulated Razorpay Checkout & Confetti Celebration                              |
+------------------------------------------------------------------------------------+
```

### Detailed Tech Stack Matrix

| Category | Technology | Version | Purpose & Architectural Role |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `^19.0.1` | Next-generation React core with modern concurrent features, fast reconciliation, and functional hook architecture. |
| **Language** | **TypeScript** | `~5.8.2` | Strict end-to-end type safety, domain model interfaces, discriminated unions, and compile-time verification. |
| **Build & Bundler** | **Vite** | `^6.2.3` | Ultra-fast ESM module dev server, optimized rollup bundling, asset processing, and sub-millisecond tree-shaking. |
| **Styling & Design System**| **Tailwind CSS** | `^4.1.14` | Modern CSS framework using `@import "tailwindcss"` and the `@tailwindcss/vite` plugin. Custom Indian boutique color palette (Terracotta `#B5563E`, Blush Pink `#F2C3B9`, Sand `#FAF2EE`, Off-White `#FDFAF9`, Charcoal `#2E2926`). |
| **Typography** | **Google Fonts** | CDN | Editorial serif headers (`Cormorant Garamond`) paired with modern ergonomic sans-serif body (`Plus Jakarta Sans`). |
| **3D Rendering Engine** | **Three.js** | `^0.186.0` | Procedural 3D mannequin geometry, parametric kurti mesh creation (bust, waist, flare, sleeves), dynamic lighting, and orbital viewport controls. |
| **Geospatial & Maps** | **Leaflet** | `^1.9.4` | Lightweight interactive mapping layer consuming OpenStreetMap tiles with custom HTML/CSS div-icons, user location pulses, and tailor pins. |
| **Iconography** | **Lucide React** | `^0.546.0` | Comprehensive feather-style vector icon collection (Scissors, Ruler, Sparkles, MapPin, Layers, etc.). |
| **AI SDK & Models** | **@google/genai** | `^2.4.0` | Official Google GenAI SDK for Gemini Multimodal Vision analysis, prompt generation, and intelligent design matching. |
| **Pattern Classifier** | **CrispAIService** | In-house | Dedicated architectural abstraction layer for Crisp AI integration with automatic fallback to client-side spatial pattern analysis. |
| **Animations & FX** | **canvas-confetti** | `^1.9.4` | Physics-based particle celebration on order completion and celebratory user milestones. |
| **Transitions** | **Motion (Framer)** | `^12.23.24`| Fluid declarative UI animations, smooth page transitions, and micro-interactions. |
| **Backend Utilities** | **Express / tsx** | `^4.21.2` / `^4.21.0` | Server runtime readiness for full-stack API expansion and backend proxy routes. |

---

## 3. High-Level System Architecture & Flow

### 3.1 The End-to-End User Journey

```
[ User Uploads Fabric / Photo ]
              │
              ▼
[ HTML5 Canvas Inspection & K-Means Clustered Extraction ]
  ├── 1. Dominant RGB extraction -> Hex conversion
  ├── 2. Euclidean distance match to 20+ Ethnic Indian Hues
  ├── 3. Edge-to-center spatial density check (Input Classification)
  └── 4. Crisp AI / Heuristic Pattern Analysis (Floral, Solid, Block Print...)
              │
              ▼
[ Input Classification Result ]
  ├── If "Fabric Only": Evaluates meterage, prevents over-cutting, drafts kurti shapes
  ├── If "Finished Garment": Extracts silhouette, neckline, sleeve cut directly
  └── If "Unclear": Flags ambiguity, prompts user for confirmation
              │
              ▼
[ Bespoke 2D & 3D Visualization Pipeline ]
  ├── 2D Dynamic Canvas: Generates high-res Front & Back previews with fabric texture transfer
  └── 3D Three.js Engine: Drapes procedural garment over mannequin with 360° orbital spin
              │
              ▼
[ Tailor Recommendation & Matchmaking ]
  ├── Geospatial search across Bangalore artisanal clusters (Indiranagar, Jayanagar, etc.)
  ├── Specialty ranking based on fabric (Chanderi, Rayon, Silk) & silhouette
  └── Dynamic quote estimation (Stitching + Lining + Express add-ons)
              │
              ▼
[ Order Customization & Placement ]
  ├── Measurements: Standard (XS-XXL) or Custom (Bust, Waist, Hip, Length, Sleeves)
  ├── Add-ons: Cotton / Butter crepe lining, concealed pockets, piping, tassels
  └── Simulated Razorpay payment & 7-Stage Live Order Tracking
```

---

## 4. Deep-Dive: Core Modules and Algorithms

### 4.1 Color Extraction & Ethnic Matching (`colorExtractor.ts`)
* **Downsampling:** Automatically downscales incoming images to a controlled 120-pixel canvas to guarantee <50ms processing times without UI blocking.
* **Deterministic K-Means:** Iteratively groups pixel RGB triplets into 4 dominant color clusters with exact percentage weightings.
* **Ethnic Color Distance Mapping:** Standard web color names (e.g., `#B5563E` = "Dark Salmon") fail to represent Indian fashion realities. The algorithm measures Euclidean color distance against an Indian Ethnic Palette:
  * Terracotta (`#B5563E`)
  * Blush Pink (`#F2C3B9`)
  * Dusty Rose (`#D8A499`)
  * Ivory / Cream (`#FAF2EE`)
  * Haldi / Mustard Yellow (`#E9C46A`)
  * Indigo Blue (`#264653`)
  * Deep Maroon (`#6B1724`)
  * Antique Gold (`#D4AF37`)
  * Sage Green (`#8A9A5B`)

### 4.2 Intelligent Input Classification (`imageAnalysisService.ts`)
The system avoids the common AI mistake of assuming every uploaded image is already a finished kurti:
* **`fabric_only`**: Detected when the pattern is continuous edge-to-edge without torso/neckline boundaries. The system will **never** hallucinate necklines or sleeves for raw fabric.
* **`finished_garment`**: Detected when silhouettes, hemlines, and neck openings are isolated against backgrounds. Only here are garment attributes extracted.
* **`unclear`**: Low-resolution or ambiguous photos prompt a polite user clarification toggle.

### 4.3 Fabric Quantity Constraint System (`aiService.ts`)
Different ethnic silhouettes demand specific minimum yardage:
* **Short Kurti / Tunic:** Requires 1.2 – 1.5 meters.
* **Straight Cut Kurti:** Requires 2.0 – 2.25 meters.
* **A-Line Kurti:** Requires 2.5 meters.
* **Flared Anarkali:** Requires 3.5 – 4.5 meters.
* **Saree Upcycling:** 5.5 meters allows twin co-ord sets, dupattas, or layered Anarkalis.

If a user uploads a 1.5m remnant, REWEAVE automatically filters out Anarkalis, displays a helpful warning badge, and suggests short kurtis and crop tops.

### 4.4 Interactive 3D Mannequin Engine (`ThreeMannequin.tsx`)
Built with Three.js r186:
* **Parametric Geometries:**
  * Torso & Shoulders: Scaled cylinder and lofted geometries.
  * Kurti Torso: Form-fitting procedural mesh (`THREE.CylinderGeometry`).
  * Flared Skirt: Tapered lower cylinder responding to silhouette selections (Straight vs Flared vs Anarkali).
  * Sleeves: Articulated cylindrical arm meshes adjusting to sleeveless, cap, 3/4th, or full-length styles.
* **Lighting Rig:** Ambient hemisphere lighting combined with warm key directional lights and cool rim backlights for realistic cloth sheen.
* **Camera Controls:** Orbital controls with clamped vertical angles, preset camera snaps (Front, Back, Side Profile), and real-time wireframe inspection mode.

### 4.5 Hyperlocal Tailor Discovery & Map (`TailorMap.tsx`)
* Integrates Leaflet with OpenStreetMap cartography.
* Custom CSS Div-Icons generate responsive pins displaying tailor names, starting rates, and active states.
* Geolocation API support to center the viewport on the user's current neighborhood.

---

## 5. File System & Codebase Architecture

```
/
├── .env.example                     # Environment variable declarations
├── index.html                       # HTML5 entry with Cormorant Garamond font links
├── metadata.json                    # AI Studio platform configuration & permissions
├── package.json                     # Dependency declarations & npm scripts
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite configuration with Tailwind CSS v4
├── public/                          # Static public assets
└── src/
    ├── App.tsx                      # Root component, router & application layout
    ├── index.css                    # Tailwind CSS v4 entry point (@import "tailwindcss")
    ├── main.tsx                     # React 19 bootstrap mount
    ├── components/
    │   ├── Footer.tsx               # Site-wide responsive footer with trust badges
    │   ├── Navbar.tsx               # Top header with route navigation, search & auth
    │   ├── TailorMap.tsx            # Leaflet-based interactive master tailor map
    │   ├── ThreeMannequin.tsx       # Three.js 3D parametric mannequin visualizer
    │   └── Toast.tsx                # Context-driven feedback notification alerts
    ├── context/
    │   └── AppContext.tsx           # Global state (auth, cart, orders, catalog, upload)
    ├── data/
    │   └── mockData.ts              # Curated catalog, tailor profiles, inspirations
    ├── lib/
    │   ├── aiService.ts             # Recommendation engine & tailor ranker
    │   ├── colorExtractor.ts        # K-Means pixel clustering & ethnic hue mapping
    │   ├── crispAIService.ts        # Crisp AI integration provider & fallback
    │   ├── designVisualizer.ts      # Bespoke 2D front/back canvas garment renderer
    │   ├── imageAnalysisService.ts  # Multimodal image & fabric constraint analyzer
    │   └── mannequinVisualizer.ts   # Helper procedural textures for 3D shaders
    ├── pages/
    │   ├── AdminPage.tsx            # Admin dashboard for catalog & tailor management
    │   ├── CreateOrderPage.tsx      # Comprehensive custom order & measurement form
    │   ├── DashboardPage.tsx        # User profile, active orders & saved wishlist
    │   ├── DesignDetailPage.tsx     # Deep-dive design inspection & tailoring specs
    │   ├── LandingPage.tsx          # High-converting homepage & feature showcase
    │   ├── LoginPage.tsx            # Quick-switch demo authentication portal
    │   ├── OrderTrackingPage.tsx    # Live 7-stage order status tracker & notes
    │   ├── OrdersListPage.tsx       # Comprehensive customer order history
    │   ├── PersonalizePage.tsx      # Step-by-step kurti customization questionnaire
    │   ├── PreviewPage.tsx          # Dual 2D/3D visual studio with angle presets
    │   ├── RecommendationsPage.tsx  # Post-upload analysis & matched design grid
    │   ├── TailorDetailPage.tsx     # Full artisan biography, portfolio & pricing
    │   ├── TailorDiscoveryPage.tsx  # Neighborhood tailor listing & map view
    │   └── UploadPage.tsx           # Drag-and-drop fabric/garment analysis portal
    └── types/
        └── index.ts                 # Central TypeScript interfaces & domain types
```

---

## 6. Comprehensive Page-by-Page Overview

| Page Component | Route Path | Core Functionality |
| :--- | :--- | :--- |
| **LandingPage** | `/` | Brand introduction, hero call-to-action, 3-step value proposition ("Upload -> Match -> Stitch"), trending kurti styles, customer testimonials, and master tailor highlights. |
| **UploadPage** | `/upload` | Drag-and-drop file upload, webcam capture ready, curated fabric sample library, input classification toggles (`fabric_only` vs `finished_garment`), and fabric length selectors. |
| **RecommendationsPage** | `/recommendations` | Visual analysis report: 4-color palette breakdown with percentages, detected patterns, fabric quantity suitability badges, and algorithmic match scoring. |
| **PersonalizePage** | `/personalize` | 6-step interactive design studio: customize silhouettes, sleeves, kurti lengths, necklines, linings, and pocket requirements. |
| **PreviewPage** | `/preview` | Real-time 3D simulation running Three.js side-by-side with 2D technical vector flats; camera orbit, wireframe mode, and instant color repainting. |
| **DesignDetailPage** | `/design/:id` | Specification sheet for master tailors with measurements, lining suggestions, stitching notes, and direct tailor hiring. |
| **TailorDiscoveryPage**| `/tailors` | Geospatial neighborhood directory with interactive Leaflet map, distance sorting, specialty filters, and price tiers. |
| **TailorDetailPage** | `/tailors/:id` | Master artisan profile, workshop location, customer reviews, photo gallery of past stitching jobs, and verified rating metrics. |
| **CreateOrderPage** | `/orders/create` | Step-by-step checkout: standard size selection (XS to XXL) or custom tape measurements, delivery scheduling, express options, and simulated payment. |
| **OrderTrackingPage** | `/orders/track/:id`| 7-step timeline (Request Sent -> Reviewing -> Price Confirmed -> Cutting/Stitching -> Quality Check -> Delivery/Pickup), direct tailor phone link, and delivery ETA. |
| **OrdersListPage** | `/orders` | Order management dashboard for viewing active, in-progress, and past completed tailoring requests. |
| **DashboardPage** | `/dashboard` | Personal customer hub with saved design bookmarks, measurement profiles, and active order countdowns. |
| **LoginPage** | `/login` | Frictionless 1-click role switcher (Regular Customer, Master Tailor, Platform Admin) with persistent LocalStorage state. |
| **AdminPage** | `/admin` | Back-office analytics, design catalog management, popularity score boosting, and tailor partner onboarding. |

---

## 7. Tailor Workflow & Order Lifecycle State Machine

Each tailoring request progresses through a deterministic 7-stage state machine:

```
[ 1. Request Sent ]
        │
        ▼
[ 2. Tailor Reviewing ] ──> (Tailor checks fabric type & measurements)
        │
        ▼
[ 3. Price Confirmed ]  ──> (Stitching + Lining charges agreed)
        │
        ▼
[ 4. Stitching Started ] ─> (Fabric cut according to CAD spec)
        │
        ▼
[ 5. Quality Check ]   ──> (Seam allowance & hem verification)
        │
        ▼
[ 6. Ready for Pickup / Delivery ]
        │
        ▼
[ 7. Completed ]
```

---

## 8. Deployment & Execution Instructions

### Development Server
```bash
npm run dev
# Starts Vite server on port 3000 at http://0.0.0.0:3000
```

### Production Build & Linting
```bash
npm run lint
# Runs TypeScript compiler (tsc --noEmit) to verify type integrity

npm run build
# Creates optimized production assets in /dist
```

### AI Studio Integration & Cloud Run
* Configured with port 3000 binding (`--port=3000 --host=0.0.0.0`).
* Configured with `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` for multimodal AI extensions.
* Frame permission granted for `geolocation` to enable hyperlocal tailor discovery.

---

*Authored for the REWEAVE Project Repository — AI Kurti Design & Tailor Platform.*
