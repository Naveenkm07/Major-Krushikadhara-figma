const fs = require('fs');
const path = require('path');

const { INITIAL_10_FARMERS, INITIAL_FARMER_SCANS } = require('./backend/dist/data/mockFarmersData.js');
const { CROPS_CATALOG, CROP_CATEGORIES } = require('./backend/dist/data/cropCalendarCatalog.js');
const { getAllBroadcastAdvisories, getAllSchemeApplications } = require('./backend/dist/services/farmerFallback.service.js');

const MANDI_RATES = [
  {
    mandi: "Mandya APMC Yard",
    district: "Mandya",
    commodity: "Paddy (Sona Masoori)",
    variety: "BPT 5204",
    modalPrice: 2450,
    minPrice: 2300,
    maxPrice: 2600,
    arrivalsTons: 185,
    trend: "+3.2%",
    trendDirection: "UP",
    updatedAt: "Today, 09:30 AM"
  },
  {
    mandi: "Kolar APMC Market",
    district: "Kolar",
    commodity: "Tomato (Hybrid)",
    variety: "Arka Rakshak",
    modalPrice: 1950,
    minPrice: 1600,
    maxPrice: 2200,
    arrivalsTons: 420,
    trend: "+5.8%",
    trendDirection: "UP",
    updatedAt: "Today, 10:15 AM"
  },
  {
    mandi: "Byadagi APMC (Haveri)",
    district: "Haveri",
    commodity: "Chilli (Byadagi Kaddi)",
    variety: "Special Grade 1",
    modalPrice: 38500,
    minPrice: 32000,
    maxPrice: 42500,
    arrivalsTons: 95,
    trend: "+4.1%",
    trendDirection: "UP",
    updatedAt: "Today, 08:45 AM"
  },
  {
    mandi: "Shimoga APMC Yard",
    district: "Shimoga",
    commodity: "Arecanut (Rashi)",
    variety: "Thirthahalli Chali",
    modalPrice: 48500,
    minPrice: 45000,
    maxPrice: 51200,
    arrivalsTons: 110,
    trend: "-1.2%",
    trendDirection: "DOWN",
    updatedAt: "Today, 11:00 AM"
  },
  {
    mandi: "Belagavi APMC Yard",
    district: "Belagavi",
    commodity: "Soybean",
    variety: "JS-335 Yellow",
    modalPrice: 4600,
    minPrice: 4350,
    maxPrice: 4800,
    arrivalsTons: 240,
    trend: "+1.8%",
    trendDirection: "UP",
    updatedAt: "Today, 09:10 AM"
  },
  {
    mandi: "Chikkamagaluru Market",
    district: "Chikkamagaluru",
    commodity: "Coffee (Arabica Cherry)",
    variety: "Sln 795",
    modalPrice: 18500,
    minPrice: 17200,
    maxPrice: 19800,
    arrivalsTons: 65,
    trend: "+2.5%",
    trendDirection: "UP",
    updatedAt: "Today, 10:45 AM"
  },
  {
    mandi: "Vijayapura APMC Yard",
    district: "Vijayapura",
    commodity: "Jowar (Maldandi)",
    variety: "White Winter",
    modalPrice: 3800,
    minPrice: 3500,
    maxPrice: 4100,
    arrivalsTons: 150,
    trend: "0.0%",
    trendDirection: "FLAT",
    updatedAt: "Today, 09:50 AM"
  },
  {
    mandi: "Yeshwanthpur APMC (Bengaluru)",
    district: "Bengaluru Urban",
    commodity: "Onion (Bellary Medium)",
    variety: "Red Local",
    modalPrice: 2200,
    minPrice: 1900,
    maxPrice: 2500,
    arrivalsTons: 580,
    trend: "-3.5%",
    trendDirection: "DOWN",
    updatedAt: "Today, 07:30 AM"
  },
  {
    mandi: "Bagalkot APMC Market",
    district: "Bagalkot",
    commodity: "Pomegranate (Bhagwa)",
    variety: "A-Grade Export",
    modalPrice: 9500,
    minPrice: 8200,
    maxPrice: 11000,
    arrivalsTons: 80,
    trend: "+6.2%",
    trendDirection: "UP",
    updatedAt: "Today, 10:00 AM"
  },
  {
    mandi: "Tumkur APMC Yard",
    district: "Tumkur",
    commodity: "Coconut (Copra)",
    variety: "Tiptur Special",
    modalPrice: 11200,
    minPrice: 10400,
    maxPrice: 12000,
    arrivalsTons: 210,
    trend: "+2.1%",
    trendDirection: "UP",
    updatedAt: "Today, 08:15 AM"
  }
];

const BROADCASTS = getAllBroadcastAdvisories();
const SCHEMES = getAllSchemeApplications();

function buildFullAdminHtml() {
  const serializedFarmers = JSON.stringify(INITIAL_10_FARMERS);
  const serializedCrops = JSON.stringify(CROPS_CATALOG);
  const serializedMandi = JSON.stringify(MANDI_RATES);
  const serializedBroadcasts = JSON.stringify(BROADCASTS);
  const serializedSchemes = JSON.stringify(SCHEMES);
  const serializedScans = JSON.stringify(INITIAL_FARMER_SCANS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KrushikaDhara Admin Portal • Enterprise Agriculture Management</title>
  <link rel="icon" href="https://img.icons8.com/color/96/sprout.png" type="image/png">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Kannada:wght@400;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Inter', 'Noto Sans Kannada', sans-serif; }
    .kannada { font-family: 'Noto Sans Kannada', sans-serif; }
    .tab-active { border-bottom: 3px solid #10b981; color: #ffffff; font-weight: 700; }
    .tab-inactive { border-bottom: 3px solid transparent; color: #a7f3d0; font-weight: 500; }
    .tab-inactive:hover { color: #ffffff; border-color: rgba(255,255,255,0.4); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    @media print {
      body * { visibility: hidden; }
      #printableDossier, #printableDossier * { visibility: visible; }
      #printableDossier { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased">

  <!-- ========================================================================= -->
  <!-- SECURE ADMIN AUTHENTICATION LOCKSCREEN OVERLAY -->
  <!-- ========================================================================= -->
  <div id="loginOverlay" class="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md hidden">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-white text-center animate-in fade-in zoom-in-95 duration-200">
      
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
        <i data-lucide="shield-check" class="w-8 h-8"></i>
      </div>

      <div>
        <h2 class="text-2xl font-black tracking-tight text-white">KrushikaDhara Admin</h2>
        <p class="text-xs text-slate-400 mt-1">Enterprise Agricultural Management Console • ಕರ್ನಾಟಕ ಕೃಷಿ ನಿರ್ವಹಣೆ</p>
      </div>

      <!-- Demo Credentials Banner -->
      <div class="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
        <div class="flex items-center justify-between text-slate-200 font-semibold">
          <span class="flex items-center gap-1.5 text-emerald-400">
            <i data-lucide="key" class="w-3.5 h-3.5"></i>
            <span>Portal Credentials</span>
          </span>
          <span class="bg-emerald-900/60 text-emerald-300 font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-700">admin / admin123</span>
        </div>
        <p class="text-[11px] text-slate-400">Pre-filled below. Click instant access or submit to sign in.</p>
      </div>

      <form onsubmit="handleAdminLogin(event)" class="space-y-4 text-left text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1.5">Admin ID</label>
          <div class="relative">
            <i data-lucide="user" class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="text"
              id="loginAdminId"
              required
              value="admin"
              placeholder="Enter Admin ID"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1.5">Password</label>
          <div class="relative">
            <i data-lucide="lock" class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="password"
              id="loginPassword"
              required
              value="admin123"
              placeholder="Enter Password"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <i data-lucide="eye" id="eyeIcon" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div id="loginErrorMsg" class="hidden text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl text-center text-[11px] font-semibold">
          Invalid Admin ID or Password. Try 'admin' / 'admin123'
        </div>

        <button
          type="button"
          onclick="quickBypassLogin()"
          class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center justify-center space-x-2 text-sm border border-emerald-400/30"
        >
          <i data-lucide="zap" class="w-4 h-4 text-yellow-300"></i>
          <span>⚡ Instant 1-Click Login (Super Admin)</span>
        </button>

        <button
          type="submit"
          class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5 text-xs"
        >
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
          <span>Access Portal (Standard Form Submit)</span>
        </button>
      </form>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MAIN STICKY HEADER -->
  <!-- ========================================================================= -->
  <header class="bg-emerald-950 text-white shadow-xl sticky top-0 z-40 border-b border-emerald-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
      
      <!-- Brand & Title -->
      <div class="flex items-center space-x-3.5">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center border border-emerald-400/40 shadow-lg shadow-emerald-950/40">
          <i data-lucide="sprout" class="w-6 h-6 text-white"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2.5">
            <h1 class="text-xl font-extrabold tracking-tight text-white">KrushikaDhara</h1>
            <span class="text-[11px] bg-emerald-800/90 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-700">Enterprise Admin</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900 text-emerald-300 border border-emerald-700">
              <span class="w-2 h-2 mr-1 bg-emerald-400 rounded-full animate-ping"></span>
              Live Telemetry
            </span>
          </div>
          <p class="text-xs text-emerald-300/90 font-medium kannada">ಕೃಷಿಕಧಾರ • ಕರ್ನಾಟಕ ಕೃಷಿ ನಿರ್ವಹಣೆ, ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ & ರೈತರ ಪೋರ್ಟಲ್</p>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center space-x-2">
        <!-- Language Switcher -->
        <button
          onclick="toggleLanguage()"
          id="langToggleBtn"
          class="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs px-3 py-1.5 rounded-xl border border-emerald-700/80 font-bold transition flex items-center space-x-1.5 shadow-sm"
          title="Toggle UI Language"
        >
          <i data-lucide="languages" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span id="langLabel">ಕನ್ನಡ (KN)</span>
        </button>

        <!-- Export Dropdown -->
        <div class="relative">
          <button
            onclick="toggleExportMenu()"
            class="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs px-3 py-1.5 rounded-xl border border-emerald-700/80 font-medium transition flex items-center space-x-1.5 shadow-sm"
          >
            <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Export</span>
            <i data-lucide="chevron-down" class="w-3 h-3"></i>
          </button>
          <div id="exportMenu" class="hidden absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl py-1 text-slate-700 text-xs z-50 border border-slate-200">
            <a href="/api/admin/export?format=csv" download class="flex items-center px-3 py-2 hover:bg-slate-100 font-medium">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 mr-2 text-emerald-600"></i>
              <span>Export CSV Format</span>
            </a>
            <a href="/api/admin/export?format=json" download class="flex items-center px-3 py-2 hover:bg-slate-100 font-medium">
              <i data-lucide="code" class="w-4 h-4 mr-2 text-blue-600"></i>
              <span>Export JSON State</span>
            </a>
          </div>
        </div>

        <!-- Super Admin Badge -->
        <div class="hidden md:flex items-center space-x-2 bg-emerald-900/50 border border-emerald-700/60 px-3 py-1 rounded-xl text-xs">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-emerald-200 font-medium">Naveen Kumar KM (Super Admin)</span>
        </div>

        <!-- Lock/Logout -->
        <button
          onclick="handleLogout()"
          class="bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs px-2.5 py-1.5 rounded-xl border border-rose-800/60 font-medium transition flex items-center space-x-1"
          title="Lock Console / Sign Out"
        >
          <i data-lucide="lock" class="w-3.5 h-3.5 text-rose-300"></i>
          <span class="hidden sm:inline">Lock</span>
        </button>
      </div>

    </div>

    <!-- Navigation Tabs Bar (6 Enterprise Tabs) -->
    <div class="bg-emerald-900/70 border-t border-emerald-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto text-xs sm:text-sm">
        <button onclick="switchTab('analytics')" id="tab-analytics" class="tab-active py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
          <span id="label-tab-analytics">Agro-Analytics</span>
        </button>
        <button onclick="switchTab('farmers')" id="tab-farmers" class="tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span id="label-tab-farmers">Farmers Directory (10)</span>
        </button>
        <button onclick="switchTab('crops')" id="tab-crops" class="tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="calendar" class="w-4 h-4"></i>
          <span id="label-tab-crops">32 Dynamic Crops</span>
        </button>
        <button onclick="switchTab('mandi')" id="tab-mandi" class="tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="trending-up" class="w-4 h-4"></i>
          <span id="label-tab-mandi">APMC Mandi Rates</span>
        </button>
        <button onclick="switchTab('advisories')" id="tab-advisories" class="tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="megaphone" class="w-4 h-4"></i>
          <span id="label-tab-advisories">Regional Broadcasts</span>
        </button>
        <button onclick="switchTab('schemes')" id="tab-schemes" class="tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition">
          <i data-lucide="landmark" class="w-4 h-4"></i>
          <span id="label-tab-schemes">Govt Schemes</span>
        </button>
      </div>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- MAIN CONTENT CONTAINER -->
  <!-- ========================================================================= -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <!-- Toast Notification Container -->
    <div id="toast" class="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 transition-all duration-300 transform translate-y-24 opacity-0 border border-slate-700">
      <div id="toastIcon" class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <i data-lucide="check" class="w-3.5 h-3.5"></i>
      </div>
      <span id="toastMsg" class="font-medium">Action completed successfully</span>
    </div>

    <!-- ======================================================================= -->
    <!-- TAB 1: AGRO-ANALYTICS & STATE COMMAND DASHBOARD -->
    <!-- ======================================================================= -->
    <div id="tabContent-analytics" class="space-y-6">
      
      <!-- Top 4 KPI Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <i data-lucide="users" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">Registered Farmers</p>
            <h3 id="statTotalFarmers" class="text-2xl font-black text-slate-900">10</h3>
            <p class="text-[11px] text-emerald-600 font-semibold">100% Karnataka Verified</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
            <i data-lucide="map" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">Farm Acreage Monitored</p>
            <h3 id="statTotalAcres" class="text-2xl font-black text-slate-900">55.2 ac</h3>
            <p class="text-[11px] text-blue-600 font-semibold">Across 10 Districts</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
            <i data-lucide="layers" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">Active Crop Parcels</p>
            <h3 id="statTotalPlots" class="text-2xl font-black text-slate-900">30</h3>
            <p class="text-[11px] text-amber-600 font-semibold">32 Dynamic Calendars</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-inner">
            <i data-lucide="activity" class="w-6 h-6"></i>
          </div>
          <div>
            <p class="text-xs text-slate-500 font-medium">State Crop Health Index</p>
            <h3 id="statHealthIndex" class="text-2xl font-black text-emerald-600">86.7%</h3>
            <p class="text-[11px] text-slate-500 font-semibold">26 Plots Optimal</p>
          </div>
        </div>

      </div>

      <!-- Soil Health & Karnataka Benchmark Banner -->
      <div class="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-800">
        <div class="space-y-1.5">
          <span class="bg-emerald-800/80 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-700 uppercase tracking-wider">UAS Bengaluru Standardized</span>
          <h2 class="text-lg font-bold">Karnataka Department of Agriculture Soil & Stage Telemetry</h2>
          <p class="text-xs text-emerald-200/90 max-w-2xl leading-relaxed">
            Real-time monitoring across 10 agro-climatic zones with dynamic N-P-K nutrient diagnostics, automated fertilizer prescription (Urea, SSP, MOP), and pest early-warning surveillance.
          </p>
        </div>
        <div class="flex items-center gap-4 bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/60">
          <div class="text-center">
            <span class="text-[10px] text-emerald-300 font-semibold block">State Avg pH</span>
            <span class="text-xl font-black text-white">6.8</span>
            <span class="text-[9px] text-emerald-400 block font-medium">Neutral / Optimal</span>
          </div>
          <div class="w-px h-8 bg-emerald-700"></div>
          <div class="text-center">
            <span class="text-[10px] text-emerald-300 font-semibold block">Avg Nitrogen</span>
            <span class="text-xl font-black text-white">215</span>
            <span class="text-[9px] text-amber-300 block font-medium">Moderate</span>
          </div>
          <div class="w-px h-8 bg-emerald-700"></div>
          <div class="text-center">
            <span class="text-[10px] text-emerald-300 font-semibold block">Avg Potash</span>
            <span class="text-xl font-black text-white">210</span>
            <span class="text-[9px] text-emerald-400 block font-medium">Adequate</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-600"></i>
              <span>Crop Acreage Distribution</span>
            </h4>
            <span class="text-[11px] text-slate-400">Total 55.2 ac</span>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="chartAcreage"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <i data-lucide="heart-pulse" class="w-4 h-4 text-rose-500"></i>
              <span>Crop Health Telemetry Breakdown</span>
            </h4>
            <span class="text-[11px] text-slate-400">30 Monitored Plots</span>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="chartHealth"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <i data-lucide="map-pin" class="w-4 h-4 text-blue-600"></i>
              <span>District Farmer Distribution</span>
            </h4>
            <span class="text-[11px] text-slate-400">10 Districts</span>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="chartDistricts"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <i data-lucide="scan" class="w-4 h-4 text-amber-500"></i>
              <span>AI Crop Disease Diagnosis Log</span>
            </h4>
            <span class="text-[11px] text-slate-400">Real Scans</span>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="chartDiseases"></canvas>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- TAB 2: FARMERS DIRECTORY & PROFILES STUDIO (10 AUTHENTIC PROFILES) -->
    <!-- ======================================================================= -->
    <div id="tabContent-farmers" class="space-y-5 hidden">
      
      <!-- Action & Filter Bar -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input
              type="text"
              id="searchInput"
              oninput="applyFilters()"
              placeholder="Search by name, mobile, district, taluk or village..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div class="flex items-center space-x-2 flex-wrap">
            <select id="districtFilter" onchange="applyFilters()" class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium">
              <option value="ALL">All Districts (10)</option>
              <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
              <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
              <option value="Shimoga">Shimoga (ಶಿವಮೊಗ್ಗ)</option>
              <option value="Kolar">Kolar (ಕೋಲಾರ)</option>
              <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ)</option>
              <option value="Chikkamagaluru">Chikkamagaluru (ಚಿಕ್ಕಮಗಳೂರು)</option>
              <option value="Davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
              <option value="Haveri">Haveri (ಹಾವೇರಿ)</option>
              <option value="Bagalkot">Bagalkot (ಬಾಗಲಕೋಟೆ)</option>
              <option value="Tumkur">Tumkur (ತುಮಕೂರು)</option>
            </select>

            <select id="cropFilter" onchange="applyFilters()" class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium">
              <option value="ALL">All Crops</option>
              <option value="Rice">Rice (Paddy)</option>
              <option value="Ragi">Ragi (Finger Millet)</option>
              <option value="Tomato">Tomato</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Arecanut">Arecanut</option>
              <option value="Coffee">Coffee</option>
              <option value="Chilli">Chilli</option>
              <option value="Soybean">Soybean</option>
              <option value="Pomegranate">Pomegranate</option>
              <option value="Coconut">Coconut</option>
            </select>

            <select id="healthFilter" onchange="applyFilters()" class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium">
              <option value="ALL">All Health</option>
              <option value="HEALTHY">Healthy</option>
              <option value="WATER_STRESSED">Water Stressed</option>
              <option value="PEST_SUSPECTED">Pest Alert</option>
              <option value="LOW_NUTRIENTS">Low Nutrients</option>
            </select>

            <button
              onclick="resetAllProfiles()"
              class="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs px-3 py-2 rounded-xl font-bold transition flex items-center space-x-1"
              title="Reset all 10 profiles to original seed"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Reset 10 Seed</span>
            </button>

            <button
              onclick="openCreateModal()"
              class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-xl font-bold shadow-sm transition flex items-center space-x-1"
            >
              <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
              <span>Add Farmer</span>
            </button>
          </div>

        </div>

        <!-- View Switcher & Counter -->
        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong id="farmerCountDisplay" class="text-slate-800">10</strong> verified Karnataka farmers
          </div>
          <div class="flex items-center space-x-1">
            <button onclick="setViewMode('grid')" id="viewModeGrid" class="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <i data-lucide="grid" class="w-4 h-4"></i>
            </button>
            <button onclick="setViewMode('table')" id="viewModeTable" class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <i data-lucide="list" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Farmers Grid View Container -->
      <div id="farmersGridContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"></div>

      <!-- Farmers Table View Container -->
      <div id="farmersTableContainer" class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-3 px-4">Farmer Details</th>
                <th class="py-3 px-4">Location</th>
                <th class="py-3 px-4">Land & Soil</th>
                <th class="py-3 px-4">Active Plots</th>
                <th class="py-3 px-4 text-center">RTC Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="farmersTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- TAB 3: 32 DYNAMIC CROPS CALENDAR MASTER LIBRARY -->
    <!-- ======================================================================= -->
    <div id="tabContent-crops" class="space-y-6 hidden">
      
      <!-- Category Buttons -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Master Dynamic Crop Calendars (32 Crops)</h3>
            <p class="text-xs text-slate-500">Official Package of Practices with complete lifecycle stages and advisories</p>
          </div>
          <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">32 Crops Supported</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pt-2 pb-1 text-xs" id="cropCategoryFilters">
          <button onclick="filterCropCatalog('ALL')" class="crop-cat-btn bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl whitespace-nowrap">All Crops (32)</button>
          <button onclick="filterCropCatalog('Cereals & Millets')" class="crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap">Cereals & Millets</button>
          <button onclick="filterCropCatalog('Pulses & Legumes')" class="crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap">Pulses & Legumes</button>
          <button onclick="filterCropCatalog('Vegetables')" class="crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap">Vegetables</button>
          <button onclick="filterCropCatalog('Commercial & Cash Crops')" class="crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap">Cash Crops</button>
          <button onclick="filterCropCatalog('Plantation & Fruits')" class="crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap">Plantation & Fruits</button>
        </div>
      </div>

      <!-- Crops Catalog Grid & Detail Split -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Crops Cards List -->
        <div class="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-1" id="cropsCatalogListContainer"></div>

        <!-- Right: Detail Growth Stage View -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5" id="cropDetailContainer">
          <div class="text-center py-12 text-slate-400">
            <i data-lucide="sprout" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
            <p class="font-medium text-sm">Select any crop on the left to inspect its complete growth lifecycle, stage progression, and stage advisories.</p>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- TAB 4: APMC MANDI RATES LIVE TELEMETRY (10 KARNATAKA MARKETS) -->
    <!-- ======================================================================= -->
    <div id="tabContent-mandi" class="space-y-6 hidden">
      
      <!-- Top Overview Banner -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-extrabold text-slate-900 text-base">Karnataka APMC Wholesale Market Telemetry</h3>
            <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">GPS Live Rates</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Live daily arrivals and modal wholesale prices across 10 major APMC market yards</p>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="fetchMandiRates()" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs px-3.5 py-2 rounded-xl font-bold border border-emerald-200 transition flex items-center space-x-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Refresh Prices</span>
          </button>
        </div>
      </div>

      <!-- Mandi Rates Table -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-3 px-4">Market Yard (Mandi)</th>
                <th class="py-3 px-4">District</th>
                <th class="py-3 px-4">Commodity & Variety</th>
                <th class="py-3 px-4 text-right">Modal Price (₹/Qtl)</th>
                <th class="py-3 px-4 text-right">Price Range (Min - Max)</th>
                <th class="py-3 px-4 text-right">Arrivals (Tons)</th>
                <th class="py-3 px-4 text-center">Day Trend</th>
                <th class="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody id="mandiTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- TAB 5: REGIONAL BROADCAST ALERTS & ADVISORIES -->
    <!-- ======================================================================= -->
    <div id="tabContent-advisories" class="space-y-6 hidden">
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Compose Broadcast Alert -->
        <div class="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h4 class="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
              <i data-lucide="send" class="w-4 h-4 text-emerald-600"></i>
              <span>Dispatch Regional Broadcast</span>
            </h4>
            <p class="text-[11px] text-slate-500">Pushes immediate notifications to farmers by district or crop</p>
          </div>

          <form onsubmit="handleSendBroadcast(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target District</label>
              <select id="broadcastDistrict" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="ALL">All Karnataka Districts (Statewide)</option>
                <option value="Mandya">Mandya (ಮಂಡ್ಯ)</option>
                <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                <option value="Shimoga">Shimoga (ಶಿವಮೊಗ್ಗ)</option>
                <option value="Kolar">Kolar (ಕೋಲಾರ)</option>
                <option value="Vijayapura">Vijayapura (ವಿಜಯಪುರ)</option>
                <option value="Chikkamagaluru">Chikkamagaluru (ಚಿಕ್ಕಮಗಳೂರು)</option>
                <option value="Davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
                <option value="Haveri">Haveri (ಹಾವೇರಿ)</option>
                <option value="Bagalkot">Bagalkot (ಬಾಗಲಕೋಟೆ)</option>
                <option value="Tumkur">Tumkur (ತುಮಕೂರು)</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Crop Filter</label>
              <select id="broadcastCrop" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="ALL">All Crops</option>
                <option value="Rice (Paddy)">Rice (Paddy)</option>
                <option value="Tomato">Tomato</option>
                <option value="Ragi">Ragi</option>
                <option value="Arecanut">Arecanut</option>
                <option value="Coffee">Coffee</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Chilli">Chilli</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Advisory Category</label>
              <select id="broadcastCategory" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="PEST_WARNING">Pest & Disease Outbreak Alert</option>
                <option value="WEATHER_ALERT">Extreme Weather & Frost/Hail Alert</option>
                <option value="MARKET_SURGE">Mandi Market Rate Surge</option>
                <option value="SCHEME_DEADLINE">Govt Subsidy Application Deadline</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Urgency Level</label>
              <select id="broadcastUrgency" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="MEDIUM">Medium / Normal Advisory</option>
                <option value="HIGH">High / Urgent Intervention Required</option>
                <option value="CRITICAL">Critical / Immediate Red Alert</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Broadcast Title (English)</label>
              <input type="text" id="broadcastTitleEn" required placeholder="e.g. Yellow Stem Borer Surveillance Alert" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Broadcast Title (ಕನ್ನಡ)</label>
              <input type="text" id="broadcastTitleKn" required placeholder="ಉದಾ: ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟದ ಎಚ್ಚರಿಕೆ" class="w-full border border-slate-300 rounded-xl p-2 text-xs kannada">
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Advisory Message (English)</label>
              <textarea id="broadcastBodyEn" rows="3" required placeholder="Enter agronomic advisory and chemical recommendations..." class="w-full border border-slate-300 rounded-xl p-2 text-xs"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Advisory Message (ಕನ್ನಡ)</label>
              <textarea id="broadcastBodyKn" rows="3" required placeholder="ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಪ್ರಮಾಣ ನಮೂದಿಸಿ..." class="w-full border border-slate-300 rounded-xl p-2 text-xs kannada"></textarea>
            </div>

            <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center space-x-1.5 transition">
              <i data-lucide="radio" class="w-4 h-4"></i>
              <span>Broadcast Alert to Registered Farmers</span>
            </button>
          </form>
        </div>

        <!-- Right: Active Broadcasts Feed -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-slate-900 text-sm">Active Dispatched Broadcasts</h4>
            <span id="broadcastCountBadge" class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">4 Active</span>
          </div>

          <div id="broadcastsFeedContainer" class="space-y-3"></div>
        </div>

      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- TAB 6: GOVERNMENT SCHEMES & SUBSIDIES TRACKER -->
    <!-- ======================================================================= -->
    <div id="tabContent-schemes" class="space-y-6 hidden">
      
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="font-extrabold text-slate-900 text-base">Karnataka & Central Agriculture Subsidies Tracker</h3>
          <p class="text-xs text-slate-500 mt-0.5">PM-KISAN, Raitha Siri, Krushi Bhagya, PMFBY, and Solar Pump Subsidies</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="fetchSchemes()" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs px-3.5 py-2 rounded-xl font-bold border border-emerald-200 transition flex items-center space-x-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Refresh Applications</span>
          </button>
        </div>
      </div>

      <!-- Schemes Table -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="py-3 px-4">Applicant Farmer</th>
                <th class="py-3 px-4">District</th>
                <th class="py-3 px-4">Scheme Name</th>
                <th class="py-3 px-4">Subsidy Amount</th>
                <th class="py-3 px-4">Application Date</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="schemesTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>

    </div>

  </main>

  <!-- ========================================================================= -->
  <!-- MODAL: EDIT / CREATE FARMER PROFILE & SOIL CARD -->
  <!-- ========================================================================= -->
  <div id="farmerModal" class="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-5 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      
      <div class="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
        <div>
          <h3 id="modalFarmerTitle" class="text-base font-bold">Farmer Profile & Soil Health Studio</h3>
          <p class="text-xs text-emerald-300">Karnataka Agricultural Directorate Database</p>
        </div>
        <button onclick="closeFarmerModal()" class="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Modal Tabs (Profile Info vs Soil Health Card) -->
      <div class="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-4 text-xs font-semibold">
        <button onclick="setModalTab('info')" id="modalTab-info" class="pb-2 border-b-2 border-emerald-600 text-emerald-800">
          Personal & Land Info
        </button>
        <button onclick="setModalTab('soil')" id="modalTab-soil" class="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          UAS-B Soil Diagnostics
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4 text-xs">
        
        <!-- Tab 1: Personal & Land Info -->
        <form id="farmerForm" onsubmit="handleSaveFarmer(event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Full Name (English)</label>
              <input type="text" id="farmerName" required class="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">ಹೆಸರು (ಕನ್ನಡ)</label>
              <input type="text" id="farmerNameKn" class="w-full border border-slate-300 rounded-xl p-2.5 text-xs kannada">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Mobile Number (10 digits)</label>
              <input type="tel" id="farmerMobile" required pattern="[0-9]{10}" class="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" id="farmerEmail" class="w-full border border-slate-300 rounded-xl p-2.5 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">District</label>
              <input type="text" id="farmerDistrict" required class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Taluk</label>
              <input type="text" id="farmerTaluk" required class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Village</label>
              <input type="text" id="farmerVillage" required class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Farm Size (Acres)</label>
              <input type="number" step="0.1" id="farmerFarmSize" required class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Soil Type</label>
              <select id="farmerSoilType" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="Red Loam">Red Loam (ಕೆಂಪು ಮಣ್ಣು)</option>
                <option value="Black Cotton">Black Cotton (ಕಪ್ಪು ಮಣ್ಣು)</option>
                <option value="Laterite Soil">Laterite Soil (ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು)</option>
                <option value="Alluvial Soil">Alluvial Soil (ಮೆಕ್ಕಲು ಮಣ್ಣು)</option>
                <option value="Sandy Loam">Sandy Loam (ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು)</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Irrigation Source</label>
              <select id="farmerIrrigation" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="Borewell + Drip">Borewell + Drip</option>
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Rainfed">Rainfed (ಮಳೆಯಾಶ್ರಿತ)</option>
                <option value="Open Well + Sprinkler">Open Well + Sprinkler</option>
                <option value="River Lift">River Lift</option>
              </select>
            </div>
          </div>

          <div class="flex items-center space-x-3 pt-2">
            <input type="checkbox" id="farmerRtcVerified" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4">
            <label for="farmerRtcVerified" class="font-medium text-slate-700 text-xs">
              RTC Bhoomi Revenue Record Verified (ಕರ್ನಾಟಕ ಕಂದಾಯ ದಾಖಲೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ)
            </label>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button type="button" onclick="closeFarmerModal()" class="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm">Save Profile</button>
          </div>
        </form>

        <!-- Tab 2: UAS Bengaluru Soil Diagnostics -->
        <div id="modalSoilSection" class="space-y-4 hidden">
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed">
            <strong class="font-bold">UAS Bengaluru Standard Soil Benchmark:</strong>
            Enter soil lab test values to automatically calculate fertilizer dosage prescriptions (Urea, SSP, MOP) and soil amendments according to official Karnataka Package of Practices.
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex justify-between font-medium mb-1">
                <span>Available Nitrogen (N)</span>
                <span id="nRating" class="font-bold text-emerald-700">Normal</span>
              </div>
              <input type="range" min="100" max="450" id="soilN" oninput="updateSoilRatings()" class="w-full accent-emerald-600">
              <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Low (&lt;240)</span>
                <span id="nValDisplay" class="font-mono font-bold text-slate-700">210 kg/ha</span>
                <span>High (&gt;350)</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-medium mb-1">
                <span>Available Phosphorus (P)</span>
                <span id="pRating" class="font-bold text-emerald-700">Normal</span>
              </div>
              <input type="range" min="5" max="40" id="soilP" oninput="updateSoilRatings()" class="w-full accent-emerald-600">
              <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Low (&lt;15)</span>
                <span id="pValDisplay" class="font-mono font-bold text-slate-700">18 kg/ha</span>
                <span>High (&gt;25)</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex justify-between font-medium mb-1">
                <span>Available Potassium (K)</span>
                <span id="kRating" class="font-bold text-emerald-700">Normal</span>
              </div>
              <input type="range" min="100" max="450" id="soilK" oninput="updateSoilRatings()" class="w-full accent-emerald-600">
              <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Low (&lt;180)</span>
                <span id="kValDisplay" class="font-mono font-bold text-slate-700">195 kg/ha</span>
                <span>High (&gt;320)</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-medium mb-1">
                <span>Soil Reaction (pH Level)</span>
                <span id="phRating" class="font-bold text-emerald-700">Optimal</span>
              </div>
              <input type="range" min="4.5" max="9.5" step="0.1" id="soilPh" oninput="updateSoilRatings()" class="w-full accent-emerald-600">
              <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Acidic (&lt;6.0)</span>
                <span id="phValDisplay" class="font-mono font-bold text-slate-700">6.8</span>
                <span>Alkaline (&gt;7.8)</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Fertilizer Prescription Box -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h5 class="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <i data-lucide="flask-conical" class="w-4 h-4 text-emerald-600"></i>
              <span>Prescribed Fertilizer Dosage (Per Acre Schedule)</span>
            </h5>
            <div id="soilPrescriptionText" class="text-xs text-slate-600 leading-relaxed font-mono">
              Calculating prescription...
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-200">
            <button type="button" onclick="printFarmerDossier()" class="text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Soil Health Card (ಕರ್ನಾಟಕ ಮಣ್ಣು ಪತ್ರಿಕೆ)</span>
            </button>
            <button type="button" onclick="handleSaveSoil()" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm">
              Update Soil Diagnostics
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL: CROP PLOTS & STAGE PROGRESSION STUDIO (MATCHING APP SCREENS 1 & 2) -->
  <!-- ========================================================================= -->
  <div id="plotsModal" class="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-3 sm:p-5 hidden backdrop-blur-md">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      
      <div class="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
        <div>
          <h3 class="text-base font-bold">Crop Plots & Stage Progression Studio</h3>
          <p id="plotsFarmerTitle" class="text-xs text-emerald-300">Farmer: Naveen Kumar KM (Mandya)</p>
        </div>
        <button onclick="closePlotsModal()" class="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-6 text-xs">
        <div>
          <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
            <span>Current Active Plots</span>
            <span id="plotsCountBadge" class="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">3 Plots</span>
          </h4>
          <div id="existingPlotsContainer" class="space-y-4"></div>
        </div>

        <!-- Add New Plot Section -->
        <div class="border-t border-slate-200 pt-5 bg-slate-50 p-4 rounded-2xl border">
          <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-1.5">
            <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-600"></i>
            <span>Plant New Crop Parcel</span>
          </h4>
          
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Crop Name</label>
              <select id="newPlotCrop" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="Rice (Paddy)">Rice (Paddy) - ಭತ್ತ</option>
                <option value="Ragi">Ragi - ರಾಗಿ</option>
                <option value="Tomato">Tomato - ಟೊಮೆಟೊ</option>
                <option value="Sugarcane">Sugarcane - ಕಬ್ಬು</option>
                <option value="Arecanut">Arecanut - ಅಡಿಕೆ</option>
                <option value="Maize">Maize - ಮೆಕ್ಕೆಜೋಳ</option>
                <option value="Coffee">Coffee - ಕಾಫಿ</option>
                <option value="Chilli">Chilli - ಮೆಣಸಿನಕಾಯಿ</option>
                <option value="Coconut">Coconut - ತೆಂಗು</option>
                <option value="Banana">Banana - ಬಾಳೆ</option>
                <option value="Grapes">Grapes - ದ್ರಾಕ್ಷಿ</option>
                <option value="Pomegranate">Pomegranate - ದಾಳಿಂಬೆ</option>
                <option value="Cotton">Cotton - ಹತ್ತಿ</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Variety</label>
              <input type="text" id="newPlotVariety" placeholder="e.g. BPT 5204 / Arka Rakshak" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Area (Acres)</label>
              <input type="number" step="0.1" id="newPlotAcres" value="1.0" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Days Ago Sown</label>
              <input type="number" id="newPlotDays" value="35" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Health Condition</label>
              <select id="newPlotHealth" class="w-full border border-slate-300 rounded-xl p-2 text-xs">
                <option value="HEALTHY">🟢 Healthy</option>
                <option value="WATER_STRESSED">💧 Needs Water</option>
                <option value="LOW_NUTRIENTS">⚠️ Low Nutrients</option>
                <option value="PEST_SUSPECTED">🪲 Pest Alert</option>
              </select>
            </div>
          </div>

          <button onclick="handleAddNewPlot()" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Plot to Farm</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODAL: AI DISEASE & PEST SCANS LOG -->
  <!-- ========================================================================= -->
  <div id="scansModal" class="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-5 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      
      <div class="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
        <div>
          <h3 class="text-base font-bold">AI Crop Pest & Disease Diagnostic Log</h3>
          <p id="scansFarmerTitle" class="text-xs text-emerald-300">Farmer Diagnostics History</p>
        </div>
        <button onclick="closeScansModal()" class="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4 text-xs" id="scansContainer"></div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PRINTABLE OFFICIAL SOIL HEALTH CARD DOSSIER (A4 PRINT FORMAT) -->
  <!-- ========================================================================= -->
  <div id="printableDossier" class="hidden p-8 bg-white text-slate-900 max-w-4xl mx-auto">
    <div class="border-4 border-emerald-900 p-6 space-y-5 rounded-2xl">
      <div class="text-center border-b-2 border-emerald-900 pb-4">
        <h1 class="text-2xl font-black uppercase tracking-tight text-emerald-950">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಕೃಷಿ ಇಲಾಖೆ</h1>
        <h2 class="text-lg font-bold text-slate-800">GOVERNMENT OF KARNATAKA • DEPARTMENT OF AGRICULTURE</h2>
        <p class="text-xs text-slate-600 mt-1">ಮಣ್ಣು ಆರೋಗ್ಯ ಪತ್ರಿಕೆ & ಬೆಳೆ ನಿರ್ವಹಣಾ ವರದಿ • Official Soil Health Card & Agronomic Dossier</p>
      </div>

      <div class="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50">
        <div>
          <p><strong>ರೈತರ ಹೆಸರು (Farmer Name):</strong> <span id="printName">Naveen Kumar KM</span></p>
          <p><strong>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile):</strong> <span id="printMobile">9591502209</span></p>
          <p><strong>ಗ್ರಾಮ / ತಾಲ್ಲೂಕು (Village/Taluk):</strong> <span id="printLocation">Channasandra, Pandavapura</span></p>
        </div>
        <div>
          <p><strong>ಜಿಲ್ಲೆ (District):</strong> <span id="printDistrict">Mandya</span></p>
          <p><strong>ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (Farm Size):</strong> <span id="printAcres">4.2 Acres</span></p>
          <p><strong>ಮಣ್ಣಿನ ವಿಧ (Soil Type):</strong> <span id="printSoilType">Red Loam</span></p>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-sm text-emerald-900 mb-2">ಮಣ್ಣು ಪರೀಕ್ಷೆ ಫಲಿತಾಂಶ (Soil Nutrient Diagnostics)</h3>
        <table class="w-full border-collapse border border-slate-300 text-xs">
          <thead class="bg-slate-100">
            <tr>
              <th class="border border-slate-300 p-2">ಪೋಷಕಾಂಶ (Parameter)</th>
              <th class="border border-slate-300 p-2">ಪ್ರಮಾಣ (Measured Value)</th>
              <th class="border border-slate-300 p-2">ಗುಣಮಟ್ಟ (Rating)</th>
              <th class="border border-slate-300 p-2">ಶಿಫಾರಸು (Recommendation)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-300 p-2 font-medium">ಸಾರಜನಕ (Nitrogen - N)</td>
              <td class="border border-slate-300 p-2" id="printN">210 kg/ha</td>
              <td class="border border-slate-300 p-2 text-amber-700 font-bold" id="printNRating">Normal</td>
              <td class="border border-slate-300 p-2">Apply 25 kg Urea / acre in 2 split top dressings</td>
            </tr>
            <tr>
              <td class="border border-slate-300 p-2 font-medium">ರಂಜಕ (Phosphorus - P)</td>
              <td class="border border-slate-300 p-2" id="printP">18 kg/ha</td>
              <td class="border border-slate-300 p-2 text-emerald-700 font-bold" id="printPRating">Optimal</td>
              <td class="border border-slate-300 p-2">Apply 40 kg SSP / acre as basal dose at sowing</td>
            </tr>
            <tr>
              <td class="border border-slate-300 p-2 font-medium">ಪೊಟ್ಯಾಶ್ (Potassium - K)</td>
              <td class="border border-slate-300 p-2" id="printK">195 kg/ha</td>
              <td class="border border-slate-300 p-2 text-emerald-700 font-bold" id="printKRating">Normal</td>
              <td class="border border-slate-300 p-2">Apply 20 kg MOP (Muriate of Potash) / acre</td>
            </tr>
            <tr>
              <td class="border border-slate-300 p-2 font-medium">ಮಣ್ಣಿನ ರಸಸಾರ (pH Level)</td>
              <td class="border border-slate-300 p-2" id="printPh">6.8</td>
              <td class="border border-slate-300 p-2 text-emerald-700 font-bold" id="printPhRating">Optimal (Neutral)</td>
              <td class="border border-slate-300 p-2">Normal soil condition. Maintain organic matter with FYM</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pt-6 border-t border-slate-300 flex justify-between text-xs text-slate-500">
        <div>
          <p>ವರದಿ ನೀಡಿದ ದಿನಾಂಕ: <span id="printDate">Today</span></p>
          <p>ಕೃಷಿ ನಿರ್ದೇಶನಾಲಯ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-slate-800">ಅಧಿಕೃತ ಮುದ್ರೆ & ಸಹಿ</p>
          <p class="text-[10px]">State Agricultural Extension Officer</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- CLIENT JAVASCRIPT LOGIC & STATE ENGINE -->
  <!-- ========================================================================= -->
  <script>
    // --------------------------------------------------------------------------
    // Embedded Resilient Seed Data (Always 100% Instant, Zero Network Latency)
    // --------------------------------------------------------------------------
    const FALLBACK_10_FARMERS = ${serializedFarmers};
    const FALLBACK_32_CROPS = ${serializedCrops};
    const FALLBACK_MANDI_RATES = ${serializedMandi};
    const FALLBACK_BROADCASTS = ${serializedBroadcasts};
    const FALLBACK_SCHEMES = ${serializedSchemes};
    const FALLBACK_SCANS = ${serializedScans};

    // Dynamic API Base URL detection
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
      : (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('vercel.app')
          ? ''
          : 'https://krushikadhara-api.onrender.com');

    // Live Application State
    let allFarmers = JSON.parse(JSON.stringify(FALLBACK_10_FARMERS));
    let allCropsCatalog = JSON.parse(JSON.stringify(FALLBACK_32_CROPS));
    let allMandiRates = JSON.parse(JSON.stringify(FALLBACK_MANDI_RATES));
    let allBroadcasts = JSON.parse(JSON.stringify(FALLBACK_BROADCASTS));
    let allSchemes = JSON.parse(JSON.stringify(FALLBACK_SCHEMES));
    
    let currentPlotsFarmerMobile = null;
    let currentDossierFarmerMobile = null;
    let viewMode = 'grid';
    let selectedCropCatalogId = 'rice';
    let currentLang = 'en'; // 'en' | 'kn'

    let chartAcreage = null;
    let chartDistricts = null;
    let chartHealth = null;
    let chartDiseases = null;

    // --------------------------------------------------------------------------
    // Authentication & Lockscreen Management
    // --------------------------------------------------------------------------
    function checkAuth() {
      const isAuth = localStorage.getItem('krushikadhara_admin_auth') === 'true';
      const overlay = document.getElementById('loginOverlay');
      if (!isAuth) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    }

    function quickBypassLogin() {
      localStorage.setItem('krushikadhara_admin_auth', 'true');
      localStorage.setItem('krushikadhara_admin_token', 'krushika-adm-' + Date.now());
      document.getElementById('loginOverlay').classList.add('hidden');
      showToast('Welcome, Naveen Kumar KM (Super Admin)!');
    }

    function togglePasswordVisibility() {
      const pwd = document.getElementById('loginPassword');
      const eye = document.getElementById('eyeIcon');
      if (pwd.type === 'password') {
        pwd.type = 'text';
        eye.setAttribute('data-lucide', 'eye-off');
      } else {
        pwd.type = 'password';
        eye.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    }

    async function handleAdminLogin(e) {
      e.preventDefault();
      const id = document.getElementById('loginAdminId').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      const validIds = ['admin', 'naveenkm07', 'krushikadhara'];
      const validPasswords = ['admin123', 'admin', '123456'];

      try {
        const res = await fetch(API_BASE + '/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('krushikadhara_admin_auth', 'true');
          localStorage.setItem('krushikadhara_admin_token', data.token);
          document.getElementById('loginOverlay').classList.add('hidden');
          showToast('Welcome, ' + (data.admin?.name || 'Administrator') + '!');
          return;
        }
      } catch (err) {
        // Fallback for offline or local
      }

      if (validIds.includes(id.toLowerCase()) && validPasswords.includes(password)) {
        localStorage.setItem('krushikadhara_admin_auth', 'true');
        document.getElementById('loginOverlay').classList.add('hidden');
        showToast('Authenticated as Administrator!');
      } else {
        document.getElementById('loginErrorMsg').classList.remove('hidden');
      }
    }

    function handleLogout() {
      if (confirm('Lock the Admin Portal console?')) {
        localStorage.removeItem('krushikadhara_admin_auth');
        document.getElementById('loginOverlay').classList.remove('hidden');
        showToast('Console locked securely');
      }
    }

    // --------------------------------------------------------------------------
    // Navigation & UI Helpers
    // --------------------------------------------------------------------------
    function switchTab(tabId) {
      const tabs = ['analytics', 'farmers', 'crops', 'mandi', 'advisories', 'schemes'];
      tabs.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        const content = document.getElementById('tabContent-' + t);
        if (t === tabId) {
          btn.className = 'tab-active py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition';
          content.classList.remove('hidden');
        } else {
          btn.className = 'tab-inactive py-2.5 px-3 flex items-center space-x-2 whitespace-nowrap transition';
          content.classList.add('hidden');
        }
      });

      if (tabId === 'crops' && selectedCropCatalogId) {
        selectCropForDetail(selectedCropCatalogId);
      }
      lucide.createIcons();
    }

    function toggleExportMenu() {
      const menu = document.getElementById('exportMenu');
      menu.classList.toggle('hidden');
    }

    function toggleLanguage() {
      currentLang = currentLang === 'en' ? 'kn' : 'en';
      document.getElementById('langLabel').textContent = currentLang === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)';
      applyFilters();
      if (selectedCropCatalogId) selectCropForDetail(selectedCropCatalogId);
      renderMandiTable(allMandiRates);
      renderBroadcastsFeed(allBroadcasts);
      renderSchemesTable(allSchemes);
      showToast(currentLang === 'en' ? 'Language switched to English' : 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ');
    }

    function setViewMode(mode) {
      viewMode = mode;
      const gridBtn = document.getElementById('viewModeGrid');
      const tableBtn = document.getElementById('viewModeTable');
      const gridContainer = document.getElementById('farmersGridContainer');
      const tableContainer = document.getElementById('farmersTableContainer');

      if (mode === 'grid') {
        gridBtn.className = 'p-1.5 rounded-lg bg-emerald-100 text-emerald-800';
        tableBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:bg-slate-100';
        gridContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
      } else {
        tableBtn.className = 'p-1.5 rounded-lg bg-emerald-100 text-emerald-800';
        gridBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:bg-slate-100';
        tableContainer.classList.remove('hidden');
        gridContainer.classList.add('hidden');
      }
      lucide.createIcons();
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      toastMsg.textContent = msg;
      toast.classList.remove('translate-y-24', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
      }, 3200);
    }

    // --------------------------------------------------------------------------
    // Stats & Charts Engine
    // --------------------------------------------------------------------------
    function computeStatsFromFarmers(farmers) {
      let totalAcres = 0;
      let totalPlots = 0;
      const cropAcreage = {};
      const districtCounts = {};
      const healthCounts = { HEALTHY: 0, WATER_STRESSED: 0, PEST_SUSPECTED: 0, LOW_NUTRIENTS: 0 };

      farmers.forEach(f => {
        totalAcres += (f.farmSize || 0);
        districtCounts[f.district] = (districtCounts[f.district] || 0) + 1;
        (f.activeCrops || []).forEach(p => {
          totalPlots++;
          cropAcreage[p.cropName] = (cropAcreage[p.cropName] || 0) + (p.acreage || 1);
          healthCounts[p.healthStatus] = (healthCounts[p.healthStatus] || 0) + 1;
        });
      });

      return {
        totalFarmers: farmers.length,
        totalAcres: Math.round(totalAcres * 10) / 10,
        totalPlots,
        healthCounts,
        cropAcreage,
        districtCounts,
      };
    }

    async function fetchStats() {
      try {
        const res = await fetch(API_BASE + '/api/admin/stats');
        const data = await res.json();
        if (data.success && data.stats) {
          renderCharts(data.stats);
        }
      } catch (e) {
        renderCharts(computeStatsFromFarmers(allFarmers));
      }
    }

    function renderCharts(stats) {
      document.getElementById('statTotalFarmers').textContent = stats.totalFarmers;
      document.getElementById('statTotalAcres').textContent = stats.totalAcres + ' ac';
      document.getElementById('statTotalPlots').textContent = stats.totalPlots;

      const optimalPlots = stats.healthCounts.HEALTHY || 0;
      const healthPct = stats.totalPlots > 0 ? Math.round((optimalPlots / stats.totalPlots) * 1000) / 10 : 100;
      document.getElementById('statHealthIndex').textContent = healthPct + '%';

      // 1. Crop Acreage Bar Chart
      const cropLabels = Object.keys(stats.cropAcreage);
      const cropData = Object.values(stats.cropAcreage);

      if (chartAcreage) chartAcreage.destroy();
      const ctxAcreage = document.getElementById('chartAcreage').getContext('2d');
      chartAcreage = new Chart(ctxAcreage, {
        type: 'bar',
        data: {
          labels: cropLabels,
          datasets: [{
            label: 'Acreage (Acres)',
            data: cropData,
            backgroundColor: '#059669',
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });

      // 2. Health Breakdown Doughnut
      if (chartHealth) chartHealth.destroy();
      const ctxHealth = document.getElementById('chartHealth').getContext('2d');
      chartHealth = new Chart(ctxHealth, {
        type: 'doughnut',
        data: {
          labels: ['Healthy', 'Water Stressed', 'Pest Alert', 'Low Nutrients'],
          datasets: [{
            data: [
              stats.healthCounts.HEALTHY || 0,
              stats.healthCounts.WATER_STRESSED || 0,
              stats.healthCounts.PEST_SUSPECTED || 0,
              stats.healthCounts.LOW_NUTRIENTS || 0
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
      });

      // 3. District Farmer Distribution Doughnut
      if (chartDistricts) chartDistricts.destroy();
      const ctxDistricts = document.getElementById('chartDistricts').getContext('2d');
      chartDistricts = new Chart(ctxDistricts, {
        type: 'doughnut',
        data: {
          labels: Object.keys(stats.districtCounts),
          datasets: [{
            data: Object.values(stats.districtCounts),
            backgroundColor: ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#10b981'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
        }
      });

      // 4. Disease Diagnostics
      if (chartDiseases) chartDiseases.destroy();
      const ctxDiseases = document.getElementById('chartDiseases').getContext('2d');
      chartDiseases = new Chart(ctxDiseases, {
        type: 'bar',
        data: {
          labels: ['Yellow Stem Borer', 'Paddy Blast', 'Early Blight', 'Arecanut Koleroga', 'Powdery Mildew'],
          datasets: [{
            label: 'Confirmed Scans',
            data: [4, 3, 3, 2, 1],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // --------------------------------------------------------------------------
    // Farmers Directory Management
    // --------------------------------------------------------------------------
    async function fetchFarmers() {
      try {
        const res = await fetch(API_BASE + '/api/admin/farmers');
        const data = await res.json();
        if (data.success && Array.isArray(data.farmers)) {
          allFarmers = data.farmers;
          applyFilters();
        }
      } catch (e) {
        applyFilters();
      }
    }

    function applyFilters() {
      const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      const d = document.getElementById('districtFilter').value;
      const c = document.getElementById('cropFilter').value;
      const h = document.getElementById('healthFilter').value;

      const filtered = allFarmers.filter(f => {
        if (d !== 'ALL' && f.district.toLowerCase() !== d.toLowerCase()) return false;
        if (c !== 'ALL') {
          const hasCrop = (f.activeCrops || []).some(cp => cp.cropName.toLowerCase().includes(c.toLowerCase()));
          if (!hasCrop) return false;
        }
        if (h !== 'ALL') {
          const hasHealth = (f.activeCrops || []).some(cp => cp.healthStatus === h);
          if (!hasHealth) return false;
        }
        if (q) {
          const match = f.name.toLowerCase().includes(q) ||
            (f.nameKn || '').includes(q) ||
            f.mobile.includes(q) ||
            f.district.toLowerCase().includes(q) ||
            f.taluk.toLowerCase().includes(q) ||
            f.village.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });

      document.getElementById('farmerCountDisplay').textContent = filtered.length;
      renderFarmersGrid(filtered);
      renderFarmersTable(filtered);
      renderCharts(computeStatsFromFarmers(filtered));
    }

    function renderFarmersGrid(list) {
      const container = document.getElementById('farmersGridContainer');
      if (list.length === 0) {
        container.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 font-medium">No farmers match the selected filter criteria.</div>';
        return;
      }

      container.innerHTML = list.map(f => {
        const displayName = currentLang === 'kn' && f.nameKn ? f.nameKn : f.name;
        const subName = currentLang === 'kn' ? f.name : (f.nameKn || '');

        const plotsBadges = (f.activeCrops || []).map(p => {
          let healthColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          let healthIcon = '🟢';
          if (p.healthStatus === 'WATER_STRESSED') {
            healthColor = 'bg-blue-100 text-blue-900 border-blue-300';
            healthIcon = '💧';
          } else if (p.healthStatus === 'PEST_SUSPECTED') {
            healthColor = 'bg-rose-100 text-rose-900 border-rose-300';
            healthIcon = '🪲';
          } else if (p.healthStatus === 'LOW_NUTRIENTS') {
            healthColor = 'bg-amber-100 text-amber-900 border-amber-300';
            healthIcon = '⚠️';
          }

          return \`
            <div class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border \${healthColor}">
              <span>\${healthIcon}</span>
              <span>\${p.cropName}: \${p.acreage} ac (Day \${p.stageDayCount || 35})</span>
            </div>
          \`;
        }).join('');

        return \`
          <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <img src="\${f.photoUrl}" alt="\${f.name}" class="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm">
                <div>
                  <h4 class="font-extrabold text-slate-900 text-sm tracking-tight">\${displayName}</h4>
                  <p class="text-[11px] text-slate-500">\${subName}</p>
                  <p class="text-[11px] text-emerald-700 font-semibold font-mono">\${f.mobile}</p>
                </div>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold \${f.rtcVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                <i data-lucide="\${f.rtcVerified ? 'check-circle' : 'clock'}" class="w-3 h-3 mr-1"></i>
                \${f.rtcVerified ? 'RTC Verified' : 'Pending'}
              </span>
            </div>

            <!-- Land, Soil, Location -->
            <div class="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-[11px] border border-slate-100">
              <div>
                <span class="text-slate-400 block text-[10px]">Location</span>
                <strong class="text-slate-700 font-semibold">\${f.village}, \${f.district}</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Farm Size</span>
                <strong class="text-slate-700 font-semibold">\${f.farmSize} acres</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Soil / Irrigation</span>
                <strong class="text-slate-700 font-semibold">\${f.soilType}</strong>
              </div>
            </div>

            <!-- Active Plots -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Planted Plots (\${(f.activeCrops || []).length})</span>
              <div class="flex flex-wrap gap-1.5">
                \${plotsBadges || '<span class="text-xs text-slate-400 italic">No plots planted</span>'}
              </div>
            </div>

            <!-- Action Buttons Row -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div class="flex space-x-1.5">
                <button onclick="openPlotsModal('\${f.mobile}')" class="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center space-x-1" title="Manage Plots & Crop Calendar">
                  <i data-lucide="sprout" class="w-3.5 h-3.5"></i>
                  <span>Plots</span>
                </button>
                <button onclick="openEditModal('\${f.mobile}')" class="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold flex items-center space-x-1" title="Edit Profile & Soil Health Card">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  <span>Profile</span>
                </button>
                <button onclick="viewFarmerScans('\${f.mobile}')" class="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold flex items-center space-x-1" title="Inspect AI Disease Scans">
                  <i data-lucide="scan" class="w-3.5 h-3.5"></i>
                  <span>Scans</span>
                </button>
              </div>

              <button onclick="deleteFarmer('\${f.mobile}')" class="text-slate-300 hover:text-rose-600 p-2" title="Delete Profile">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function renderFarmersTable(list) {
      const tbody = document.getElementById('farmersTableBody');
      tbody.innerHTML = list.map(f => {
        return \`
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-4">
              <div class="flex items-center space-x-2.5">
                <img src="\${f.photoUrl}" class="w-8 h-8 rounded-xl object-cover border border-emerald-400/40">
                <div>
                  <div class="font-bold text-slate-800">\${f.name}</div>
                  <div class="text-[10px] text-slate-400 font-mono">\${f.mobile}</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="font-medium text-slate-700">\${f.village}, \${f.taluk}</div>
              <div class="text-[10px] text-slate-400 font-semibold">\${f.district}</div>
            </td>
            <td class="py-3 px-4">
              <div class="font-semibold text-slate-800">\${f.farmSize} ac</div>
              <div class="text-[10px] text-slate-400">\${f.soilType} • \${f.irrigationType}</div>
            </td>
            <td class="py-3 px-4">
              <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">\${(f.activeCrops || []).length} Plots</span>
            </td>
            <td class="py-3 px-4 text-center">
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold \${f.rtcVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                \${f.rtcVerified ? 'Verified' : 'Pending'}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex justify-end space-x-1.5">
                <button onclick="openPlotsModal('\${f.mobile}')" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  <i data-lucide="sprout" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="openEditModal('\${f.mobile}')" class="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="deleteFarmer('\${f.mobile}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
      lucide.createIcons();
    }

    // --------------------------------------------------------------------------
    // APMC Mandi Rates Live Telemetry
    // --------------------------------------------------------------------------
    async function fetchMandiRates() {
      try {
        const res = await fetch(API_BASE + '/api/admin/mandi/overview');
        const data = await res.json();
        if (data.success && Array.isArray(data.rates)) {
          allMandiRates = data.rates;
          renderMandiTable(allMandiRates);
          showToast('APMC Mandi Rates refreshed live!');
        }
      } catch (e) {
        renderMandiTable(allMandiRates);
      }
    }

    function renderMandiTable(rates) {
      const tbody = document.getElementById('mandiTableBody');
      tbody.innerHTML = rates.map(m => {
        let trendBadge = 'bg-slate-100 text-slate-700';
        if (m.trendDirection === 'UP') trendBadge = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        else if (m.trendDirection === 'DOWN') trendBadge = 'bg-rose-100 text-rose-800 border border-rose-300';

        return \`
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-4 font-bold text-slate-800">\${m.mandi}</td>
            <td class="py-3 px-4 font-semibold text-slate-600">\${m.district}</td>
            <td class="py-3 px-4">
              <strong class="text-emerald-900">\${m.commodity}</strong>
              <span class="text-[10px] text-slate-400 block">\${m.variety}</span>
            </td>
            <td class="py-3 px-4 text-right font-black text-slate-900 text-sm">₹\${m.modalPrice.toLocaleString()}</td>
            <td class="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">₹\${m.minPrice.toLocaleString()} - ₹\${m.maxPrice.toLocaleString()}</td>
            <td class="py-3 px-4 text-right font-semibold text-slate-700">\${m.arrivalsTons} T</td>
            <td class="py-3 px-4 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold \${trendBadge}">
                \${m.trend}
              </span>
            </td>
            <td class="py-3 px-4 text-right text-slate-400 text-[10px] font-medium">\${m.updatedAt}</td>
          </tr>
        \`;
      }).join('');
    }

    // --------------------------------------------------------------------------
    // 32 Dynamic Crops Catalog Master Inspector
    // --------------------------------------------------------------------------
    async function fetchCropsCatalog() {
      try {
        const res = await fetch(API_BASE + '/api/admin/crops');
        const data = await res.json();
        if (data.success && Array.isArray(data.crops)) {
          allCropsCatalog = data.crops;
          renderCropsList(allCropsCatalog);
        }
      } catch (e) {
        renderCropsList(allCropsCatalog);
      }
    }

    function filterCropCatalog(cat) {
      document.querySelectorAll('.crop-cat-btn').forEach(b => {
        b.className = 'crop-cat-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl whitespace-nowrap';
      });
      event.target.className = 'crop-cat-btn bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl whitespace-nowrap';

      if (cat === 'ALL') {
        renderCropsList(allCropsCatalog);
      } else {
        const filtered = allCropsCatalog.filter(c => c.category === cat);
        renderCropsList(filtered);
      }
    }

    function renderCropsList(crops) {
      const container = document.getElementById('cropsCatalogListContainer');
      container.innerHTML = crops.map(c => {
        const isSelected = c.id === selectedCropCatalogId;
        return \`
          <div onclick="selectCropForDetail('\${c.id}')" class="cursor-pointer p-4 rounded-2xl border transition \${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'} space-y-1.5">
            <div class="flex items-center justify-between">
              <h5 class="font-extrabold text-slate-800 text-xs">\${c.nameEn}</h5>
              <span class="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">\${c.totalDays} Days</span>
            </div>
            <p class="text-[11px] text-emerald-800 font-medium kannada">\${c.nameKn}</p>
            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>\${c.category}</span>
              <span class="font-semibold text-emerald-700">\${(c.stages || []).length} Stages</span>
            </div>
          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function selectCropForDetail(cropId) {
      selectedCropCatalogId = cropId;
      const crop = allCropsCatalog.find(c => c.id === cropId);
      if (!crop) return;

      renderCropsList(allCropsCatalog);

      const container = document.getElementById('cropDetailContainer');
      const stagesHtml = (crop.stages || []).map((s, idx) => {
        const advisoriesHtml = (s.advisories || []).map(a => {
          let badgeColor = 'bg-blue-100 text-blue-800';
          if (a.category === 'FERTILIZER') badgeColor = 'bg-emerald-100 text-emerald-800';
          if (a.category === 'PEST_PREVENTION') badgeColor = 'bg-rose-100 text-rose-800';

          return \`
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded \${badgeColor}">\${a.category}</span>
                <span class="text-[10px] font-bold \${a.urgency === 'HIGH' ? 'text-rose-600' : 'text-slate-400'}">\${a.urgency} Urgency</span>
              </div>
              <h6 class="font-bold text-slate-800 text-xs">\${currentLang === 'kn' && a.titleKn ? a.titleKn : a.titleEn}</h6>
              <p class="text-[11px] text-slate-600 leading-relaxed">\${currentLang === 'kn' && a.bodyKn ? a.bodyKn : a.bodyEn}</p>
            </div>
          \`;
        }).join('');

        return \`
          <div class="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">\${idx + 1}</span>
                <h5 class="font-extrabold text-slate-800 text-xs">\${s.nameEn} <span class="kannada text-emerald-700 font-semibold">(\${s.nameKn})</span></h5>
              </div>
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Days \${s.startDay} - \${s.endDay}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">\${currentLang === 'kn' && s.descriptionKn ? s.descriptionKn : s.descriptionEn}</p>
            <div class="space-y-2 pt-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Stage Advisories</span>
              <div class="space-y-2">
                \${advisoriesHtml}
              </div>
            </div>
          </div>
        \`;
      }).join('');

      container.innerHTML = \`
        <div class="space-y-5">
          <div class="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-xl font-black text-slate-900">\${crop.nameEn}</h3>
                <span class="text-sm font-bold text-emerald-700 kannada">\${crop.nameKn}</span>
                <span class="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">\${crop.category}</span>
              </div>
              <p class="text-xs text-slate-500 italic mt-0.5 font-mono">\${crop.scientificName || 'Botanical Standard'} • Total Duration: \${crop.totalDays} Days</p>
            </div>

            <button onclick="prefillBroadcastForCrop('\${crop.nameEn}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition">
              <i data-lucide="megaphone" class="w-3.5 h-3.5"></i>
              <span>Broadcast Advisory</span>
            </button>
          </div>

          <!-- Varieties & Agro Profile -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span class="text-slate-400 text-[10px] block font-semibold">Recommended Varieties (Karnataka UAS)</span>
              <span class="font-bold text-slate-800">\${(crop.popularVarieties || []).join(', ')}</span>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] block font-semibold">Optimal Soil Type & Seasons</span>
              <span class="font-bold text-slate-800">\${crop.soilType} • \${(crop.seasons || []).join(', ')}</span>
            </div>
          </div>

          <!-- Stages -->
          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Crop Lifecycle Growth Stages (\${(crop.stages || []).length})</h4>
            <div class="space-y-3">
              \${stagesHtml}
            </div>
          </div>
        </div>
      \`;
      lucide.createIcons();
    }

    function prefillBroadcastForCrop(cropName) {
      switchTab('advisories');
      document.getElementById('broadcastCrop').value = cropName;
      document.getElementById('broadcastTitleEn').value = 'Urgent Advisory: ' + cropName + ' Crop Care';
      document.getElementById('broadcastTitleKn').value = 'ತುರ್ತು ಸಲಹೆ: ' + cropName + ' ಬೆಳೆ ಪೋಷಣೆ';
      showToast('Prefilled advisory form for ' + cropName);
    }

    // --------------------------------------------------------------------------
    // Regional Broadcasts System
    // --------------------------------------------------------------------------
    async function fetchBroadcasts() {
      try {
        const res = await fetch(API_BASE + '/api/admin/broadcasts');
        const data = await res.json();
        if (data.success && Array.isArray(data.broadcasts)) {
          allBroadcasts = data.broadcasts;
          renderBroadcastsFeed(allBroadcasts);
        }
      } catch (e) {
        renderBroadcastsFeed(allBroadcasts);
      }
    }

    function renderBroadcastsFeed(broadcasts) {
      document.getElementById('broadcastCountBadge').textContent = broadcasts.length + ' Active';
      const container = document.getElementById('broadcastsFeedContainer');
      if (broadcasts.length === 0) {
        container.innerHTML = '<p class="text-slate-400 italic">No active regional broadcasts currently.</p>';
        return;
      }

      container.innerHTML = broadcasts.map(b => {
        let borderUrgency = 'border-l-4 border-l-blue-500';
        if (b.urgency === 'HIGH') borderUrgency = 'border-l-4 border-l-amber-500';
        if (b.urgency === 'CRITICAL') borderUrgency = 'border-l-4 border-l-rose-500';

        const displayTitle = currentLang === 'kn' && b.titleKn ? b.titleKn : b.titleEn;
        const displayBody = currentLang === 'kn' && b.bodyKn ? b.bodyKn : b.bodyEn;

        return \`
          <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2 \${borderUrgency}">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">\${b.category}</span>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">\${b.district} • \${b.crop}</span>
              </div>
              <button onclick="handleDeleteBroadcast('\${b.id}')" class="text-slate-300 hover:text-rose-600 p-1" title="Delete Broadcast">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <h5 class="font-extrabold text-slate-900 text-xs">\${displayTitle}</h5>
            <p class="text-xs text-slate-600 leading-relaxed">\${displayBody}</p>

            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span class="flex items-center space-x-1">
                <i data-lucide="check-check" class="w-3 h-3 text-emerald-500"></i>
                <span>Delivered to <strong>\${b.deliveredCount || 1608}</strong> farmers</span>
              </span>
              <span>\${new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    async function handleSendBroadcast(e) {
      e.preventDefault();
      const payload = {
        district: document.getElementById('broadcastDistrict').value,
        crop: document.getElementById('broadcastCrop').value,
        category: document.getElementById('broadcastCategory').value,
        urgency: document.getElementById('broadcastUrgency').value,
        titleEn: document.getElementById('broadcastTitleEn').value,
        titleKn: document.getElementById('broadcastTitleKn').value,
        bodyEn: document.getElementById('broadcastBodyEn').value,
        bodyKn: document.getElementById('broadcastBodyKn').value,
      };

      try {
        const res = await fetch(API_BASE + '/api/admin/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          allBroadcasts.unshift(data.broadcast);
          renderBroadcastsFeed(allBroadcasts);
          showToast('Regional Alert broadcasted successfully!');
          e.target.reset();
          return;
        }
      } catch (err) {}

      // Fallback local
      const newBcast = { id: 'bcast-' + Date.now(), ...payload, createdAt: new Date().toISOString(), deliveredCount: 1608 };
      allBroadcasts.unshift(newBcast);
      renderBroadcastsFeed(allBroadcasts);
      showToast('Regional Alert dispatched (Local & Edge)!');
      e.target.reset();
    }

    async function handleDeleteBroadcast(id) {
      if (!confirm('Withdraw this regional advisory broadcast?')) return;
      try {
        await fetch(API_BASE + '/api/admin/broadcasts/' + id, { method: 'DELETE' });
      } catch (e) {}

      allBroadcasts = allBroadcasts.filter(b => b.id !== id);
      renderBroadcastsFeed(allBroadcasts);
      showToast('Broadcast withdrawn');
    }

    // --------------------------------------------------------------------------
    // Govt Schemes Tracker
    // --------------------------------------------------------------------------
    async function fetchSchemes() {
      try {
        const res = await fetch(API_BASE + '/api/admin/schemes');
        const data = await res.json();
        if (data.success && Array.isArray(data.applications)) {
          allSchemes = data.applications;
          renderSchemesTable(allSchemes);
          showToast('Schemes applications refreshed');
        }
      } catch (e) {
        renderSchemesTable(allSchemes);
      }
    }

    function renderSchemesTable(apps) {
      const tbody = document.getElementById('schemesTableBody');
      tbody.innerHTML = apps.map(a => {
        let statusBadge = 'bg-slate-100 text-slate-700';
        if (a.status === 'SANCTIONED') statusBadge = 'bg-blue-100 text-blue-800';
        if (a.status === 'DISBURSED') statusBadge = 'bg-emerald-100 text-emerald-800';
        if (a.status === 'UNDER_VERIFICATION') statusBadge = 'bg-amber-100 text-amber-800';

        return \`
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-4 font-bold text-slate-800">\${a.farmerName}</td>
            <td class="py-3 px-4 font-semibold text-slate-600">\${a.district}</td>
            <td class="py-3 px-4">
              <strong class="text-emerald-950">\${a.schemeName}</strong>
              <span class="text-[10px] text-slate-400 block font-mono">\${a.schemeId}</span>
            </td>
            <td class="py-3 px-4 font-extrabold text-emerald-700">₹\${(a.subsidyAmount || 0).toLocaleString()}</td>
            <td class="py-3 px-4 text-slate-500 text-[11px]">\${a.appliedAt || 'Recent'}</td>
            <td class="py-3 px-4 text-center">
              <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold \${statusBadge}">
                \${a.status}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex justify-end space-x-1">
                <button onclick="handleUpdateSchemeStatus('\${a.farmerMobile}', '\${a.schemeId}', 'SANCTIONED')" class="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold">Approve</button>
                <button onclick="handleUpdateSchemeStatus('\${a.farmerMobile}', '\${a.schemeId}', 'DISBURSED')" class="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold">Disburse</button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    async function handleUpdateSchemeStatus(farmerMobile, schemeId, status) {
      try {
        await fetch(API_BASE + '/api/admin/schemes/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farmerMobile, schemeId, status }),
        });
      } catch (e) {}

      const item = allSchemes.find(s => s.farmerMobile === farmerMobile && s.schemeId === schemeId);
      if (item) item.status = status;
      renderSchemesTable(allSchemes);
      showToast('Application updated to ' + status);
    }

    // --------------------------------------------------------------------------
    // Farmer Modal & UAS Bengaluru Soil Card
    // --------------------------------------------------------------------------
    function openCreateModal() {
      currentDossierFarmerMobile = null;
      document.getElementById('modalFarmerTitle').textContent = 'Register New Karnataka Farmer';
      document.getElementById('farmerForm').reset();
      document.getElementById('farmerMobile').readOnly = false;
      document.getElementById('farmerRtcVerified').checked = true;
      setModalTab('info');
      document.getElementById('farmerModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function openEditModal(mobile) {
      const f = allFarmers.find(x => x.mobile === mobile);
      if (!f) return;
      currentDossierFarmerMobile = mobile;

      document.getElementById('modalFarmerTitle').textContent = 'Edit Profile: ' + f.name + ' (' + f.district + ')';
      document.getElementById('farmerName').value = f.name;
      document.getElementById('farmerNameKn').value = f.nameKn || '';
      document.getElementById('farmerMobile').value = f.mobile;
      document.getElementById('farmerMobile').readOnly = true;
      document.getElementById('farmerEmail').value = f.email || '';
      document.getElementById('farmerDistrict').value = f.district;
      document.getElementById('farmerTaluk').value = f.taluk;
      document.getElementById('farmerVillage').value = f.village;
      document.getElementById('farmerFarmSize').value = f.farmSize;
      document.getElementById('farmerSoilType').value = f.soilType || 'Red Loam';
      document.getElementById('farmerIrrigation').value = f.irrigationType || 'Borewell + Drip';
      document.getElementById('farmerRtcVerified').checked = !!f.rtcVerified;

      document.getElementById('soilN').value = f.soilN || 210;
      document.getElementById('soilP').value = f.soilP || 18;
      document.getElementById('soilK').value = f.soilK || 195;
      document.getElementById('soilPh').value = f.soilPh || 6.8;

      updateSoilRatings();
      setModalTab('info');
      document.getElementById('farmerModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function setModalTab(tab) {
      const infoBtn = document.getElementById('modalTab-info');
      const soilBtn = document.getElementById('modalTab-soil');
      const infoSec = document.getElementById('farmerForm');
      const soilSec = document.getElementById('modalSoilSection');

      if (tab === 'info') {
        infoBtn.className = 'pb-2 border-b-2 border-emerald-600 text-emerald-800 font-bold';
        soilBtn.className = 'pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800';
        infoSec.classList.remove('hidden');
        soilSec.classList.add('hidden');
      } else {
        soilBtn.className = 'pb-2 border-b-2 border-emerald-600 text-emerald-800 font-bold';
        infoBtn.className = 'pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800';
        soilSec.classList.remove('hidden');
        infoSec.classList.add('hidden');
        updateSoilRatings();
      }
      lucide.createIcons();
    }

    function updateSoilRatings() {
      const n = parseInt(document.getElementById('soilN').value, 10);
      const p = parseInt(document.getElementById('soilP').value, 10);
      const k = parseInt(document.getElementById('soilK').value, 10);
      const ph = parseFloat(document.getElementById('soilPh').value);

      document.getElementById('nValDisplay').textContent = n + ' kg/ha';
      document.getElementById('pValDisplay').textContent = p + ' kg/ha';
      document.getElementById('kValDisplay').textContent = k + ' kg/ha';
      document.getElementById('phValDisplay').textContent = ph.toFixed(1);

      // Nitrogen Rating
      let nRate = 'Normal';
      if (n < 240) nRate = 'Deficient (ಕಡಿಮೆ)';
      else if (n > 350) nRate = 'High (ಹೆಚ್ಚು)';
      document.getElementById('nRating').textContent = nRate;

      // Phosphorus Rating
      let pRate = 'Normal';
      if (p < 15) pRate = 'Deficient (ಕಡಿಮೆ)';
      else if (p > 25) pRate = 'High (ಹೆಚ್ಚು)';
      document.getElementById('pRating').textContent = pRate;

      // Potassium Rating
      let kRate = 'Normal';
      if (k < 180) kRate = 'Deficient (ಕಡಿಮೆ)';
      else if (k > 320) kRate = 'High (ಹೆಚ್ಚು)';
      document.getElementById('kRating').textContent = kRate;

      // pH Rating
      let phRate = 'Optimal / Neutral (ಉತ್ತಮ)';
      if (ph < 6.0) phRate = 'Acidic (ಆಮ್ಲೀಯ)';
      else if (ph > 7.8) phRate = 'Alkaline (ಕ್ಷಾರೀಯ)';
      document.getElementById('phRating').textContent = phRate;

      // Dynamic Agronomic Prescription
      let ureaKg = n < 240 ? 35 : (n > 350 ? 15 : 25);
      let sspKg = p < 15 ? 55 : (p > 25 ? 20 : 35);
      let mopKg = k < 180 ? 25 : (k > 320 ? 10 : 15);
      let amendment = ph < 6.0 ? 'Apply Agricultural Lime @ 200 kg/acre to neutralize acidity.' : (ph > 7.8 ? 'Apply Gypsum @ 250 kg/acre + 5 Tons FYM compost to neutralize alkalinity.' : 'Soil reaction is optimal for major crops.');

      document.getElementById('soilPrescriptionText').innerHTML = \`
        • <strong>Urea (Nitrogen 46%):</strong> \${ureaKg} kg/acre (Apply in 2 split top-dressings)<br>
        • <strong>Single Super Phosphate (SSP 16%):</strong> \${sspKg} kg/acre as basal dose<br>
        • <strong>MOP (Muriate of Potash 60%):</strong> \${mopKg} kg/acre at tillering/panicle<br>
        • <strong>Soil Amendment Advisory:</strong> \${amendment}
      \`;
    }

    function printFarmerDossier() {
      const f = allFarmers.find(x => x.mobile === currentDossierFarmerMobile);
      if (!f) return;

      document.getElementById('printName').textContent = f.name + (f.nameKn ? ' (' + f.nameKn + ')' : '');
      document.getElementById('printMobile').textContent = f.mobile;
      document.getElementById('printLocation').textContent = f.village + ', ' + f.taluk;
      document.getElementById('printDistrict').textContent = f.district;
      document.getElementById('printAcres').textContent = f.farmSize + ' Acres';
      document.getElementById('printSoilType').textContent = f.soilType || 'Red Loam';

      document.getElementById('printN').textContent = (f.soilN || 210) + ' kg/ha';
      document.getElementById('printP').textContent = (f.soilP || 18) + ' kg/ha';
      document.getElementById('printK').textContent = (f.soilK || 195) + ' kg/ha';
      document.getElementById('printPh').textContent = (f.soilPh || 6.8);
      document.getElementById('printDate').textContent = new Date().toLocaleDateString();

      window.print();
    }

    function closeFarmerModal() {
      document.getElementById('farmerModal').classList.add('hidden');
    }

    async function handleSaveFarmer(e) {
      e.preventDefault();
      const mobile = document.getElementById('farmerMobile').value.trim();
      const payload = {
        name: document.getElementById('farmerName').value.trim(),
        nameKn: document.getElementById('farmerNameKn').value.trim(),
        mobile,
        email: document.getElementById('farmerEmail').value.trim() || null,
        district: document.getElementById('farmerDistrict').value.trim(),
        taluk: document.getElementById('farmerTaluk').value.trim(),
        village: document.getElementById('farmerVillage').value.trim(),
        farmSize: parseFloat(document.getElementById('farmerFarmSize').value) || 1.0,
        soilType: document.getElementById('farmerSoilType').value,
        irrigationType: document.getElementById('farmerIrrigation').value,
        rtcVerified: document.getElementById('farmerRtcVerified').checked,
      };

      try {
        const isEdit = !!currentDossierFarmerMobile;
        const url = isEdit ? (API_BASE + '/api/admin/farmers/' + mobile) : (API_BASE + '/api/admin/farmers');
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          const idx = allFarmers.findIndex(f => f.mobile === mobile);
          if (idx !== -1) allFarmers[idx] = { ...allFarmers[idx], ...payload };
          else allFarmers.push({ ...payload, activeCrops: [] });
          applyFilters();
          closeFarmerModal();
          showToast('Farmer profile saved successfully!');
          return;
        }
      } catch (err) {}

      // Fallback local
      const idx = allFarmers.findIndex(f => f.mobile === mobile);
      if (idx !== -1) allFarmers[idx] = { ...allFarmers[idx], ...payload };
      else allFarmers.push({ ...payload, activeCrops: [], photoUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=240&h=240&fit=crop&auto=format' });
      applyFilters();
      closeFarmerModal();
      showToast('Farmer profile saved (Local & Edge)!');
    }

    async function handleSaveSoil() {
      const n = parseInt(document.getElementById('soilN').value, 10);
      const p = parseInt(document.getElementById('soilP').value, 10);
      const k = parseInt(document.getElementById('soilK').value, 10);
      const ph = parseFloat(document.getElementById('soilPh').value);

      try {
        await fetch(API_BASE + '/api/admin/farmers/' + currentDossierFarmerMobile + '/soil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soilN: n, soilP: p, soilK: k, soilPh: ph }),
        });
      } catch (e) {}

      const f = allFarmers.find(x => x.mobile === currentDossierFarmerMobile);
      if (f) {
        f.soilN = n; f.soilP = p; f.soilK = k; f.soilPh = ph;
      }
      closeFarmerModal();
      showToast('Soil diagnostics updated successfully!');
    }

    async function deleteFarmer(mobile) {
      if (!confirm('Are you sure you want to remove this farmer record?')) return;
      try {
        await fetch(API_BASE + '/api/admin/farmers/' + mobile, { method: 'DELETE' });
      } catch (e) {}

      allFarmers = allFarmers.filter(f => f.mobile !== mobile);
      applyFilters();
      showToast('Farmer removed');
    }

    // --------------------------------------------------------------------------
    // Crop Plots & Stage Progression Studio (Screens 1 & 2 Alignment)
    // --------------------------------------------------------------------------
    function openPlotsModal(mobile) {
      currentPlotsFarmerMobile = mobile;
      const f = allFarmers.find(x => x.mobile === mobile);
      if (!f) return;

      document.getElementById('plotsFarmerTitle').textContent = 'Farmer: ' + f.name + ' (' + f.district + ' • ' + f.farmSize + ' ac)';
      renderExistingPlots(f.activeCrops || []);
      document.getElementById('plotsModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function calculateStageDetails(cropName, day) {
      const crop = allCropsCatalog.find(c => c.nameEn.toLowerCase().includes(cropName.toLowerCase())) || allCropsCatalog[0];
      const totalDays = crop?.totalDays || 115;
      const stages = crop?.stages || [];

      let activeStage = stages[0];
      for (const s of stages) {
        if (day >= s.startDay && day <= s.endDay) {
          activeStage = s;
          break;
        }
      }
      if (!activeStage && stages.length > 0) {
        activeStage = stages[stages.length - 1];
      }

      return { crop, totalDays, stages, activeStage };
    }

    function renderExistingPlots(plots) {
      document.getElementById('plotsCountBadge').textContent = plots.length + ' Plots';
      const container = document.getElementById('existingPlotsContainer');
      if (plots.length === 0) {
        container.innerHTML = '<p class="text-slate-400 italic">No crop plots planted currently on this farm.</p>';
        return;
      }

      container.innerHTML = plots.map(p => {
        const day = p.stageDayCount || 35;
        const { totalDays, stages, activeStage } = calculateStageDetails(p.cropName, day);
        const progressPercent = Math.min(100, Math.round((day / totalDays) * 100));

        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        let badgeText = '🟢 Healthy';
        if (p.healthStatus === 'WATER_STRESSED') {
          badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
          badgeText = '💧 Needs Water';
        } else if (p.healthStatus === 'PEST_SUSPECTED') {
          badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
          badgeText = '🪲 Pest Alert';
        } else if (p.healthStatus === 'LOW_NUTRIENTS') {
          badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
          badgeText = '⚠️ Low Nutrients';
        }

        // Active Advisories for this stage
        const advisories = activeStage?.advisories || [];
        const fertAdv = advisories.find(a => a.category === 'FERTILIZER');
        const pestAdv = advisories.find(a => a.category === 'PEST_PREVENTION');
        const irrAdv = advisories.find(a => a.category === 'IRRIGATION');

        // Timeline stages HTML
        const timelineHtml = stages.map(st => {
          let stStatus = 'text-slate-400';
          let stBadge = '<span class="text-[9px] text-slate-400">Upcoming</span>';
          if (day > st.endDay) {
            stStatus = 'text-emerald-700 font-bold';
            stBadge = '<span class="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">✓ Completed</span>';
          } else if (day >= st.startDay && day <= st.endDay) {
            stStatus = 'text-emerald-900 font-extrabold';
            stBadge = '<span class="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">● In Progress</span>';
          }

          return \`
            <div class="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-slate-50">
              <span class="\${stStatus}">\${st.nameEn} (Days \${st.startDay}-\${st.endDay})</span>
              \${stBadge}
            </div>
          \`;
        }).join('');

        return \`
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 shadow-sm">
            
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center space-x-2">
                <span class="font-black text-slate-800 text-sm">\${p.cropName}</span>
                <span class="text-[11px] text-slate-500 font-medium">\${p.variety}</span>
                <span class="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">\${p.acreage} ac</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border \${badgeColor}">\${badgeText}</span>
              </div>
              <button onclick="handleDeletePlot('\${p.id}')" class="text-rose-500 hover:text-rose-700 p-1" title="Remove plot">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Active Growth Stage Card (Screen 2 Alignment) -->
            <div class="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-3.5 space-y-2 border border-emerald-800">
              <div class="flex items-center justify-between text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                <span>Active Growth Stage</span>
                <span>Day \${day} of \${totalDays}</span>
              </div>
              <div class="font-extrabold text-sm text-white flex items-center justify-between">
                <span>\${activeStage?.nameEn || p.currentStage}</span>
                <span class="text-xs text-emerald-200 font-mono">\${progressPercent}%</span>
              </div>
              <div class="w-full bg-emerald-950/80 rounded-full h-2 overflow-hidden border border-emerald-700/60">
                <div class="bg-emerald-400 h-2 rounded-full transition-all" style="width: \${progressPercent}%"></div>
              </div>
              <!-- Interactive Range Slider -->
              <div class="pt-1">
                <input
                  type="range"
                  min="1"
                  max="\${totalDays}"
                  value="\${day}"
                  oninput="handleSliderChange('\${p.id}', this.value)"
                  class="w-full accent-emerald-400 cursor-pointer"
                />
                <div class="flex justify-between text-[9px] text-emerald-300/80 mt-0.5">
                  <span>Day 1 (Sowing)</span>
                  <span>Drag slider to advance lifecycle stage</span>
                  <span>Day \${totalDays} (Harvest)</span>
                </div>
              </div>
            </div>

            <!-- Plot Health Check-in (4 Buttons Matching Screen 2) -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Plot Health Check-in</span>
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  onclick="quickUpdatePlotHealth('\${p.id}', 'HEALTHY')"
                  class="py-1.5 px-2 rounded-xl text-center text-[10px] font-bold border transition \${p.healthStatus === 'HEALTHY' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'}"
                >
                  🟢 Healthy
                </button>
                <button
                  onclick="quickUpdatePlotHealth('\${p.id}', 'WATER_STRESSED')"
                  class="py-1.5 px-2 rounded-xl text-center text-[10px] font-bold border transition \${p.healthStatus === 'WATER_STRESSED' ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'}"
                >
                  💧 Needs Water
                </button>
                <button
                  onclick="quickUpdatePlotHealth('\${p.id}', 'LOW_NUTRIENTS')"
                  class="py-1.5 px-2 rounded-xl text-center text-[10px] font-bold border transition \${p.healthStatus === 'LOW_NUTRIENTS' ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'}"
                >
                  ⚠️ Low Nutrients
                </button>
                <button
                  onclick="quickUpdatePlotHealth('\${p.id}', 'PEST_SUSPECTED')"
                  class="py-1.5 px-2 rounded-xl text-center text-[10px] font-bold border transition \${p.healthStatus === 'PEST_SUSPECTED' ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'}"
                >
                  🪲 Pest Alert
                </button>
              </div>
            </div>

            <!-- Today's Stage Advisories (Matching Screen 2) -->
            <div class="space-y-2 bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Today's Stage Advisories (Day \${day})</span>
              \${fertAdv ? \`
                <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div class="flex items-center space-x-1.5 text-emerald-800 font-bold text-[11px]">
                    <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i>
                    <span>FERTILIZER: \${fertAdv.titleEn}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 leading-relaxed">\${fertAdv.bodyEn}</p>
                </div>
              \` : ''}
              \${pestAdv ? \`
                <div class="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <div class="flex items-center space-x-1.5 text-rose-800 font-bold text-[11px]">
                    <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
                    <span>PEST_PREVENTION: \${pestAdv.titleEn}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 leading-relaxed">\${pestAdv.bodyEn}</p>
                </div>
              \` : ''}
            </div>

            <!-- Growth Lifecycle Timeline Stepper -->
            <div class="space-y-1 bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Growth Lifecycle Timeline</span>
              <div class="space-y-1">
                \${timelineHtml}
              </div>
            </div>

          </div>
        \`;
      }).join('');
      lucide.createIcons();
    }

    function closePlotsModal() {
      document.getElementById('plotsModal').classList.add('hidden');
    }

    async function handleSliderChange(plotId, newDay) {
      const f = allFarmers.find(x => x.mobile === currentPlotsFarmerMobile);
      if (!f || !Array.isArray(f.activeCrops)) return;
      const plot = f.activeCrops.find(p => p.id === plotId);
      if (!plot) return;

      plot.stageDayCount = parseInt(newDay, 10);
      const { activeStage } = calculateStageDetails(plot.cropName, plot.stageDayCount);
      if (activeStage) {
        plot.currentStage = activeStage.nameEn;
      }

      renderExistingPlots(f.activeCrops);
      applyFilters();

      // Persist to backend
      try {
        await fetch(API_BASE + '/api/admin/farmers/' + currentPlotsFarmerMobile + '/plots/' + plotId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageDayCount: plot.stageDayCount, currentStage: plot.currentStage }),
        });
      } catch (e) {}
    }

    async function quickUpdatePlotHealth(plotId, healthStatus) {
      const f = allFarmers.find(x => x.mobile === currentPlotsFarmerMobile);
      if (!f || !Array.isArray(f.activeCrops)) return;
      const plot = f.activeCrops.find(p => p.id === plotId);
      if (plot) {
        plot.healthStatus = healthStatus;
        renderExistingPlots(f.activeCrops);
        applyFilters();
      }

      try {
        await fetch(API_BASE + '/api/admin/farmers/' + currentPlotsFarmerMobile + '/plots/' + plotId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ healthStatus }),
        });
      } catch (e) {}

      showToast('Plot health updated to ' + healthStatus);
    }

    async function handleAddNewPlot() {
      const cropName = document.getElementById('newPlotCrop').value;
      const variety = document.getElementById('newPlotVariety').value.trim() || 'High-Yield Local';
      const acreage = parseFloat(document.getElementById('newPlotAcres').value) || 1.0;
      const days = parseInt(document.getElementById('newPlotDays').value, 10) || 35;
      const health = document.getElementById('newPlotHealth').value;

      const payload = {
        cropName,
        variety,
        acreage,
        season: 'Kharif',
        irrigationMethod: 'Borewell + Drip',
        stageDayCount: days,
        currentStage: 'TILLERING_VEGETATIVE',
        healthStatus: health,
      };

      try {
        const res = await fetch(API_BASE + '/api/admin/farmers/' + currentPlotsFarmerMobile + '/plots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.farmer) {
          const idx = allFarmers.findIndex(f => f.mobile === currentPlotsFarmerMobile);
          if (idx !== -1) allFarmers[idx] = data.farmer;
          renderExistingPlots(data.farmer.activeCrops || []);
          applyFilters();
          showToast('New plot added to farm!');
          return;
        }
      } catch (err) {}

      // Fallback local
      const f = allFarmers.find(x => x.mobile === currentPlotsFarmerMobile);
      if (f) {
        if (!f.activeCrops) f.activeCrops = [];
        f.activeCrops.push({ id: 'plot-' + Date.now(), ...payload });
        renderExistingPlots(f.activeCrops);
        applyFilters();
        showToast('Plot added (Local & Edge)!');
      }
    }

    async function handleDeletePlot(plotId) {
      if (!confirm('Remove this planted crop plot parcel?')) return;
      try {
        await fetch(API_BASE + '/api/admin/farmers/' + currentPlotsFarmerMobile + '/plots/' + plotId, {
          method: 'DELETE',
        });
      } catch (e) {}

      const f = allFarmers.find(x => x.mobile === currentPlotsFarmerMobile);
      if (f && Array.isArray(f.activeCrops)) {
        f.activeCrops = f.activeCrops.filter(p => p.id !== plotId);
        renderExistingPlots(f.activeCrops);
        applyFilters();
        showToast('Plot deleted');
      }
    }

    // --------------------------------------------------------------------------
    // AI Disease Scans Inspector
    // --------------------------------------------------------------------------
    async function viewFarmerScans(mobile) {
      const f = allFarmers.find(x => x.mobile === mobile);
      if (!f) return;

      document.getElementById('scansFarmerTitle').textContent = f.name + ' (' + f.district + ') AI Scans';
      const container = document.getElementById('scansContainer');
      const farmerScans = FALLBACK_SCANS[mobile] || [];

      if (farmerScans.length === 0) {
        container.innerHTML = '<p class="text-slate-400 italic py-6 text-center">No AI disease scans logged yet for this farmer.</p>';
      } else {
        container.innerHTML = farmerScans.map(s => {
          let sevColor = 'bg-amber-100 text-amber-800';
          if (s.severity === 'HIGH') sevColor = 'bg-rose-100 text-rose-800';

          return \`
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-extrabold text-slate-800 text-xs">\${s.diseaseName}</span>
                  <span class="text-[11px] text-emerald-700 kannada font-medium block">\${s.diseaseNameKn || ''}</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold \${sevColor}">\${s.severity} Severity</span>
              </div>
              <div class="flex items-center space-x-2 text-[11px] text-slate-500">
                <span>Crop: <strong>\${s.cropName}</strong></span>
                <span>•</span>
                <span>Confidence: <strong>\${Math.round(s.confidence * 100)}%</strong></span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <p><strong>Treatment:</strong> \${currentLang === 'kn' && s.treatmentKn ? s.treatmentKn : s.treatmentEn}</p>
                <p><strong>Prevention:</strong> \${currentLang === 'kn' && s.preventionKn ? s.preventionKn : s.preventionEn}</p>
              </div>
            </div>
          \`;
        }).join('');
      }

      document.getElementById('scansModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeScansModal() {
      document.getElementById('scansModal').classList.add('hidden');
    }

    // --------------------------------------------------------------------------
    // Seed Reset
    // --------------------------------------------------------------------------
    async function resetAllProfiles() {
      if (!confirm('Reset all 10 authentic Karnataka farmer profiles to default seed state?')) return;
      try {
        await fetch(API_BASE + '/api/admin/reset-profiles', { method: 'POST' });
      } catch (e) {}

      allFarmers = JSON.parse(JSON.stringify(FALLBACK_10_FARMERS));
      applyFilters();
      showToast('All 10 authentic Karnataka profiles restored!');
    }

    // --------------------------------------------------------------------------
    // Lifecycle Initialization
    // --------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
      checkAuth();
      lucide.createIcons();

      // Initial fast render from embedded fallback
      renderCharts(computeStatsFromFarmers(allFarmers));
      applyFilters();
      renderMandiTable(allMandiRates);
      renderCropsList(allCropsCatalog);
      selectCropForDetail('rice');
      renderBroadcastsFeed(allBroadcasts);
      renderSchemesTable(allSchemes);

      // Async live sync with backend
      fetchStats();
      fetchFarmers();
      fetchMandiRates();
      fetchCropsCatalog();
      fetchBroadcasts();
      fetchSchemes();
    });
  </script>
</body>
</html>
`;
}

// 1. Generate full HTML string
const html = buildFullAdminHtml();
console.log('Generated Admin HTML length:', html.length, 'characters');

// 2. Write to backend/src/utils/adminPanelHtml.ts as an export
const tsContent = 'export const ADMIN_PANEL_HTML = ' + JSON.stringify(html) + ';\n';
fs.writeFileSync(path.join(__dirname, 'backend', 'src', 'utils', 'adminPanelHtml.ts'), tsContent, 'utf8');
console.log('✅ Updated backend/src/utils/adminPanelHtml.ts');

// 3. Write directly to admin-panel/index.html
fs.writeFileSync(path.join(__dirname, 'admin-panel', 'index.html'), html, 'utf8');
console.log('✅ Updated admin-panel/index.html');
