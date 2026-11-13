import asyncio
from playwright.async_api import async_playwright
import os

assets_dir = r"Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\ppt_assets"

# Common styles
CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1200px;
    height: 600px;
    overflow: hidden;
    padding: 20px;
}
.diagram-container {
    width: 100%;
    height: 100%;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.header {
    text-align: center;
    margin-bottom: 12px;
}
.header h2 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}
.header p {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
}
.badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
"""

HTML_ARCH = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{CSS}
.grid-5 {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    flex: 1;
    align-items: stretch;
}}
.tier-card {{
    background: #ffffff;
    border-radius: 12px;
    border: 1.5px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    overflow: hidden;
}}
.tier-head {{
    padding: 10px 12px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    gap: 2px;
}}
.tier-head span {{
    font-size: 10px;
    opacity: 0.9;
    font-weight: 500;
}}
.tier-body {{
    padding: 12px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11px;
    color: #334155;
    background: #ffffff;
}}
.tech-pill {{
    background: #f1f5f9;
    border-left: 3px solid;
    padding: 6px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 11px;
    line-height: 1.3;
}}
.arrow-bar {{
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px 10px;
    background: #e2e8f0;
    border-radius: 8px;
    margin-top: 10px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="header">
        <h2>KrushikaDhara: End-to-End 5-Tier Architecture</h2>
        <p>Production High-Availability Distributed Pipeline for Smallholder Agronomy</p>
    </div>
    <div class="grid-5">
        <!-- Tier 1 -->
        <div class="tier-card" style="border-color: #10b981;">
            <div class="tier-head" style="background: #059669;">
                <div>TIER 1: CLIENT APP</div>
                <span>Farmer UI / Offline PWA</span>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #059669; color: #065f46;">
                    <strong>React Native 0.88</strong><br>Expo SDK 58 Core
                </div>
                <div class="tech-pill" style="border-color: #059669; color: #065f46;">
                    <strong>Camera & Mic Stream</strong><br>16kHz PCM Audio Capture
                </div>
                <div class="tech-pill" style="border-color: #059669; color: #065f46;">
                    <strong>AsyncStorage Cache</strong><br>Offline-First Resiliency
                </div>
                <div class="tech-pill" style="border-color: #059669; color: #065f46;">
                    <strong>Kannada Vernacular</strong><br>Zero-Literacy Design
                </div>
            </div>
        </div>

        <!-- Tier 2 -->
        <div class="tier-card" style="border-color: #f59e0b;">
            <div class="tier-head" style="background: #d97706;">
                <div>TIER 2: EDGE AI</div>
                <span>On-Device Neural Engine</span>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #d97706; color: #92400e;">
                    <strong>YOLO11s INT8 TFLite</strong><br>14.2 MB Compressed
                </div>
                <div class="tech-pill" style="border-color: #d97706; color: #92400e;">
                    <strong>340ms Inference</strong><br>ARM64 NNAPI Hardware
                </div>
                <div class="tech-pill" style="border-color: #d97706; color: #92400e;">
                    <strong>102 Pest Classes</strong><br>Zero-Server Overhead
                </div>
                <div class="tech-pill" style="border-color: #d97706; color: #92400e;">
                    <strong>100% Offline</strong><br>Works without SIM/4G
                </div>
            </div>
        </div>

        <!-- Tier 3 -->
        <div class="tier-card" style="border-color: #3b82f6;">
            <div class="tier-head" style="background: #2563eb;">
                <div>TIER 3: CLOUD GATEWAY</div>
                <span>Render Managed Service</span>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #2563eb; color: #1e40af;">
                    <strong>Node.js 22 LTS</strong><br>Express Microservice
                </div>
                <div class="tech-pill" style="border-color: #2563eb; color: #1e40af;">
                    <strong>Docker Container</strong><br>Render Cloud Auto-Scale
                </div>
                <div class="tech-pill" style="border-color: #2563eb; color: #1e40af;">
                    <strong>REST API + JWT</strong><br>Secure Auth Gateway
                </div>
                <div class="tech-pill" style="border-color: #2563eb; color: #1e40af;">
                    <strong>CORS & Compression</strong><br>Low-Bandwidth Opt
                </div>
            </div>
        </div>

        <!-- Tier 4 -->
        <div class="tier-card" style="border-color: #8b5cf6;">
            <div class="tier-head" style="background: #7c3aed;">
                <div>TIER 4: AI REASONING</div>
                <span>Multimodal Vision & Voice</span>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #7c3aed; color: #5b21b6;">
                    <strong>Gemini 2.5 Flash</strong><br>Foliar Pathology & NPK
                </div>
                <div class="tech-pill" style="border-color: #7c3aed; color: #5b21b6;">
                    <strong>Sarvam AI STT</strong><br>Kannada Voice (saaras:v2)
                </div>
                <div class="tech-pill" style="border-color: #7c3aed; color: #5b21b6;">
                    <strong>Sarvam AI TTS</strong><br>Natural Kannada Audio
                </div>
                <div class="tech-pill" style="border-color: #7c3aed; color: #5b21b6;">
                    <strong>Context Injection</strong><br>Stage-Specific Advisory
                </div>
            </div>
        </div>

        <!-- Tier 5 -->
        <div class="tier-card" style="border-color: #06b6d4;">
            <div class="tier-head" style="background: #0891b2;">
                <div>TIER 5: PERSISTENCE</div>
                <span>Serverless Cloud Data</span>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #0891b2; color: #155e75;">
                    <strong>Neon PostgreSQL 16</strong><br>Serverless Auto-Scale
                </div>
                <div class="tech-pill" style="border-color: #0891b2; color: #155e75;">
                    <strong>Prisma ORM</strong><br>Type-Safe Data Schema
                </div>
                <div class="tech-pill" style="border-color: #0891b2; color: #155e75;">
                    <strong>Agmarknet Telemetry</strong><br>31 Districts Mandi Data
                </div>
                <div class="tech-pill" style="border-color: #0891b2; color: #155e75;">
                    <strong>Open-Meteo Engine</strong><br>GDD & Microclimate
                </div>
            </div>
        </div>
    </div>
    <div class="arrow-bar">
        <span>📱 Client Bus (340ms)</span>
        <span>⇄</span>
        <span>⚡ On-Device TFLite NNAPI</span>
        <span>⇄</span>
        <span>🌐 HTTPS / Secure TLS REST</span>
        <span>⇄</span>
        <span>🧠 Gemini + Sarvam AI</span>
        <span>⇄</span>
        <span>💾 Neon Cloud Database</span>
    </div>
</div>
</body>
</html>
"""

HTML_PIPELINE = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{CSS}
.pipe-flow {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex: 1;
}}
.step-box {{
    background: #ffffff;
    border-radius: 12px;
    border: 2px solid #cbd5e1;
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.04);
}}
.step-header {{
    padding: 10px;
    font-weight: 800;
    font-size: 12px;
    text-transform: uppercase;
    text-align: center;
    color: white;
}}
.step-content {{
    padding: 12px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11px;
}}
.sub-badge {{
    background: #f8fafc;
    border-left: 3px solid;
    padding: 5px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: #334155;
}}
.arrow-svg {{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    color: #94a3b8;
    font-weight: 900;
    font-size: 18px;
}}
.decision-gate {{
    background: #fffbeb;
    border: 2px dashed #f59e0b;
    border-radius: 12px;
    width: 140px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 10px;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="header">
        <h2>Two-Stage Hybrid Computer Vision & Foliar Pathology Pipeline</h2>
        <p>Combining Ultra-Fast On-Device Edge Detection with Cloud Multimodal Reasoning</p>
    </div>
    <div class="pipe-flow">
        <!-- Step 1 -->
        <div class="step-box" style="border-color: #64748b;">
            <div class="step-header" style="background: #475569;">
                1. Image Ingestion
            </div>
            <div class="step-content">
                <div class="sub-badge" style="border-color: #475569;">
                    <strong>Smartphone Camera</strong><br>Raw RGB Ingestion
                </div>
                <div class="sub-badge" style="border-color: #475569;">
                    <strong>Preprocessing</strong><br>640×640 Letterboxing
                </div>
                <div class="sub-badge" style="border-color: #475569;">
                    <strong>Normalization</strong><br>Mean: 0.0, Std: 255.0
                </div>
            </div>
        </div>

        <div class="arrow-svg">➔</div>

        <!-- Step 2 -->
        <div class="step-box" style="border-color: #059669;">
            <div class="step-header" style="background: #059669;">
                2. Stage 1: Edge YOLO11s
            </div>
            <div class="step-content">
                <div class="sub-badge" style="border-color: #059669;">
                    <strong>INT8 Quantized</strong><br>TensorFlow Lite 14.2MB
                </div>
                <div class="sub-badge" style="border-color: #059669;">
                    <strong>102 Pest Classes</strong><br>Stem Borer, Blast, Rust
                </div>
                <div class="sub-badge" style="border-color: #059669;">
                    <strong>340ms Inference</strong><br>Direct NPU/NNAPI Exec
                </div>
            </div>
        </div>

        <div class="arrow-svg">➔</div>

        <!-- Decision Gate -->
        <div class="decision-gate">
            <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase;">Confidence Check</span>
            <div style="font-size: 10px; font-weight: 600; color: #78350f; margin-top: 6px;">
                Confidence ≥ 85%?<br>
                <span style="color: #059669;">✔ Immediate Rx</span><br>
                <span style="color: #dc2626;">✖ Leaf Pathology</span>
            </div>
        </div>

        <div class="arrow-svg">➔</div>

        <!-- Step 3 -->
        <div class="step-box" style="border-color: #7c3aed;">
            <div class="step-header" style="background: #7c3aed;">
                3. Stage 2: Gemini Vision
            </div>
            <div class="step-content">
                <div class="sub-badge" style="border-color: #7c3aed;">
                    <strong>Gemini 2.5 Flash</strong><br>Foliar Necrosis & Blight
                </div>
                <div class="sub-badge" style="border-color: #7c3aed;">
                    <strong>NPK Deficiency</strong><br>Chlorosis & Yellowing
                </div>
                <div class="sub-badge" style="border-color: #7c3aed;">
                    <strong>Bio-Pesticide Rx</strong><br>Kannada Dosage Cards
                </div>
            </div>
        </div>

        <div class="arrow-svg">➔</div>

        <!-- Step 4 -->
        <div class="step-box" style="border-color: #0284c7;">
            <div class="step-header" style="background: #0284c7;">
                4. Offline Fallback
            </div>
            <div class="step-content">
                <div class="sub-badge" style="border-color: #0284c7;">
                    <strong>Embedded DB</strong><br>Pre-cached Agronomy
                </div>
                <div class="sub-badge" style="border-color: #0284c7;">
                    <strong>100% Zero Network</strong><br>Unbroken Diagnostic
                </div>
                <div class="sub-badge" style="border-color: #0284c7;">
                    <strong>Safe Bio-Dosages</strong><br>UAS Bengaluru Verified
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
"""

HTML_VOICE = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{CSS}
.voice-grid {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    flex: 1;
}}
.v-card {{
    background: #ffffff;
    border-radius: 12px;
    border: 1.5px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.03);
}}
.v-head {{
    padding: 10px;
    color: white;
    font-size: 12px;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
}}
.v-body {{
    padding: 12px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11px;
}}
.v-pill {{
    background: #f8fafc;
    border-left: 3px solid;
    padding: 6px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: #334155;
    line-height: 1.3;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="header">
        <h2>Bilingual Voice Agronomist: Dialogue & Reasoning Engine</h2>
        <p>Conversational Kannada & English Agricultural Advisory with Stage-Aware Context Injection</p>
    </div>
    <div class="voice-grid">
        <!-- 1 -->
        <div class="v-card" style="border-color: #dc2626;">
            <div class="v-head" style="background: #dc2626;">
                1. Voice Capture
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong>Farmer Utterance</strong><br>Kannada/English speech
                </div>
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong>Expo Audio Engine</strong><br>16kHz PCM mono WAV
                </div>
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong>Waveform Viz</strong><br>Real-time visual feedback
                </div>
            </div>
        </div>

        <!-- 2 -->
        <div class="v-card" style="border-color: #d97706;">
            <div class="v-head" style="background: #d97706;">
                2. Sarvam AI STT
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #d97706;">
                    <strong>saaras:v2 Model</strong><br>High-accuracy Indic STT
                </div>
                <div class="v-pill" style="border-color: #d97706;">
                    <strong>Dialect Resilient</strong><br>Mandya/Mysuru idioms
                </div>
                <div class="v-pill" style="border-color: #d97706;">
                    <strong>Unicode Kannada</strong><br>Text transcript tokens
                </div>
            </div>
        </div>

        <!-- 3 -->
        <div class="v-card" style="border-color: #059669;">
            <div class="v-head" style="background: #059669;">
                3. Context Injection
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #059669;">
                    <strong>Farmer Profile</strong><br>Naveen Kumar KM
                </div>
                <div class="v-pill" style="border-color: #059669;">
                    <strong>Active Crop & Age</strong><br>Rice (Paddy), Day 35
                </div>
                <div class="v-pill" style="border-color: #059669;">
                    <strong>Current Stage</strong><br>Tillering & Vegetative
                </div>
            </div>
        </div>

        <!-- 4 -->
        <div class="v-card" style="border-color: #7c3aed;">
            <div class="v-head" style="background: #7c3aed;">
                4. Gemini 2.5 Flash
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #7c3aed;">
                    <strong>Agronomic Logic</strong><br>UAS Package of Practice
                </div>
                <div class="v-pill" style="border-color: #7c3aed;">
                    <strong>Dynamic Guidance</strong><br>Specific fertilizer/irrigation
                </div>
                <div class="v-pill" style="border-color: #7c3aed;">
                    <strong>Structured JSON</strong><br>Clean vernacular response
                </div>
            </div>
        </div>

        <!-- 5 -->
        <div class="v-card" style="border-color: #2563eb;">
            <div class="v-head" style="background: #2563eb;">
                5. Dual Action Output
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong>Sarvam AI TTS</strong><br>Natural Kannada voice audio
                </div>
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong>Interactive Card</strong><br>Stage dos and don'ts
                </div>
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong>Web Speech Fallback</strong><br>Zero-cost audio fallback
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
"""

HTML_LIFECYCLE = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{CSS}
.life-container {{
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
}}
.stage-timeline {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-top: 5px;
}}
.st-card {{
    background: #ffffff;
    border-radius: 12px;
    border: 1.5px solid #cbd5e1;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
}}
.st-head {{
    padding: 8px 10px;
    color: white;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
}}
.st-body {{
    padding: 10px 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 10.5px;
}}
.st-pill {{
    background: #f8fafc;
    border-left: 3px solid;
    padding: 5px 6px;
    border-radius: 4px;
    font-weight: 600;
    color: #334155;
    line-height: 1.25;
}}
.mandi-strip {{
    background: #ecfdf5;
    border: 1.5px solid #10b981;
    border-radius: 12px;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}}
.mandi-title {{
    font-size: 13px;
    font-weight: 800;
    color: #065f46;
}}
.mandi-desc {{
    font-size: 11px;
    font-weight: 600;
    color: #047857;
}}
.mandi-tags {{
    display: flex;
    gap: 8px;
}}
.mandi-tag {{
    background: #ffffff;
    border: 1px solid #6ee7b7;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 10.5px;
    font-weight: 700;
    color: #065f46;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="header">
        <h2>5-Stage Crop Lifecycle Progression & APMC Mandi Telemetry</h2>
        <p>Physiological Crop Monitoring with Real-Time Karnataka Agricultural Market Intelligence</p>
    </div>
    <div class="life-container">
        <div class="stage-timeline">
            <!-- Stage 1 -->
            <div class="st-card" style="border-color: #84cc16;">
                <div class="st-head" style="background: #65a30d;">
                    1. Land Prep (0-15d)
                </div>
                <div class="st-body">
                    <div class="st-pill" style="border-color: #65a30d;">
                        <strong>Soil Preparation</strong><br>Deep ploughing & leveling
                    </div>
                    <div class="st-pill" style="border-color: #65a30d;">
                        <strong>Basal Nutrition</strong><br>FYM + Bio-fertilizers
                    </div>
                    <div class="st-pill" style="border-color: #65a30d;">
                        <strong>Seed Treatment</strong><br>Pseudomonas treatment
                    </div>
                </div>
            </div>

            <!-- Stage 2 -->
            <div class="st-card" style="border-color: #10b981;">
                <div class="st-head" style="background: #059669;">
                    2. Tillering (16-45d)
                </div>
                <div class="st-body">
                    <div class="st-pill" style="border-color: #059669;">
                        <strong>Vegetative Boost</strong><br>Urea + MOP split dose
                    </div>
                    <div class="st-pill" style="border-color: #059669;">
                        <strong>Weed Control</strong><br>Cono-weeder inter-culture
                    </div>
                    <div class="st-pill" style="border-color: #059669;">
                        <strong>Pest Vigilance</strong><br>Stem borer & whorl maggot
                    </div>
                </div>
            </div>

            <!-- Stage 3 -->
            <div class="st-card" style="border-color: #06b6d4;">
                <div class="st-head" style="background: #0891b2;">
                    3. Flowering (46-75d)
                </div>
                <div class="st-body">
                    <div class="st-pill" style="border-color: #0891b2;">
                        <strong>Panicle Emergence</strong><br>Maintain 2-5cm water level
                    </div>
                    <div class="st-pill" style="border-color: #0891b2;">
                        <strong>Pathology Check</strong><br>Neck blast & sheath blight
                    </div>
                    <div class="st-pill" style="border-color: #0891b2;">
                        <strong>Micronutrients</strong><br>Zinc/Boron foliar spray
                    </div>
                </div>
            </div>

            <!-- Stage 4 -->
            <div class="st-card" style="border-color: #f59e0b;">
                <div class="st-head" style="background: #d97706;">
                    4. Ripening (76-105d)
                </div>
                <div class="st-body">
                    <div class="st-pill" style="border-color: #d97706;">
                        <strong>Grain Filling</strong><br>Dough & yellow maturity
                    </div>
                    <div class="st-pill" style="border-color: #d97706;">
                        <strong>Field Drainage</strong><br>Drain water 10d before cut
                    </div>
                    <div class="st-pill" style="border-color: #d97706;">
                        <strong>Hopper Watch</strong><br>Brown planthopper check
                    </div>
                </div>
            </div>

            <!-- Stage 5 -->
            <div class="st-card" style="border-color: #ef4444;">
                <div class="st-head" style="background: #dc2626;">
                    5. Harvest (106-120d)
                </div>
                <div class="st-body">
                    <div class="st-pill" style="border-color: #dc2626;">
                        <strong>Harvesting</strong><br>85% panicles golden brown
                    </div>
                    <div class="st-pill" style="border-color: #dc2626;">
                        <strong>Moisture Target</strong><br>Sun dry to &lt;14% moisture
                    </div>
                    <div class="st-pill" style="border-color: #dc2626;">
                        <strong>APMC Mandi Sale</strong><br>Agmarknet market dispatch
                    </div>
                </div>
            </div>
        </div>

        <div class="mandi-strip">
            <div>
                <div class="mandi-title">📊 Live Agmarknet APMC Mandi Telemetry</div>
                <div class="mandi-desc">Real-time daily arrivals, modal prices, and mandi price trend forecasting across 31 Karnataka APMCs</div>
            </div>
            <div class="mandi-tags">
                <span class="mandi-tag">📍 Mandya APMC</span>
                <span class="mandi-tag">📍 Mysuru APMC</span>
                <span class="mandi-tag">📍 Ramanagara APMC</span>
                <span class="mandi-tag">₹ Modal Price Trends</span>
            </div>
        </div>
    </div>
</div>
</body>
</html>
"""

async def generate():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Viewport 1200x600 with 2.5 device_scale_factor = 3000x1500 Retina resolution!
        page = await browser.new_page(viewport={"width": 1200, "height": 600}, device_scale_factor=2.5)

        items = [
            ("arch_diagram.png", HTML_ARCH),
            ("pipeline_diagram.png", HTML_PIPELINE),
            ("voice_diagram.png", HTML_VOICE),
            ("lifecycle_diagram.png", HTML_LIFECYCLE),
        ]

        for filename, html in items:
            await page.set_content(html)
            path = os.path.join(assets_dir, filename)
            await page.screenshot(path=path)
            print(f"Generated ultra-HD diagram: {path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(generate())
