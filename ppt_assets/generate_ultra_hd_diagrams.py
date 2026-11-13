import asyncio
from playwright.async_api import async_playwright
import os

assets_dir = r"Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\ppt_assets"

# Common CSS for 2400x1150 canvas (Large, bold, high-clarity typography)
COMMON_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2400px;
    height: 1150px;
    overflow: hidden;
    padding: 24px;
}
.diagram-canvas {
    width: 100%;
    height: 100%;
    background: #f8fafc;
    border: 3px solid #cbd5e1;
    border-radius: 24px;
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 14px;
}
.title-group h2 {
    font-size: 38px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}
.title-group p {
    font-size: 22px;
    color: #475569;
    font-weight: 600;
    margin-top: 4px;
}
.header-badge {
    background: #002060;
    color: #ffffff;
    padding: 8px 18px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
}
"""

HTML_ARCH = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{COMMON_CSS}
.grid-5 {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    flex: 1;
    align-items: stretch;
    margin-bottom: 18px;
}}
.tier-card {{
    background: #ffffff;
    border-radius: 18px;
    border: 2.5px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 6px 16px rgba(0,0,0,0.04);
    overflow: hidden;
}}
.tier-head {{
    padding: 16px 18px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 4px;
}}
.tier-head-title {{
    font-size: 24px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.tier-head-sub {{
    font-size: 17px;
    opacity: 0.95;
    font-weight: 600;
}}
.tier-body {{
    padding: 18px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #ffffff;
    justify-content: space-around;
}}
.tech-pill {{
    background: #f8fafc;
    border-left: 5px solid;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 19px;
    line-height: 1.35;
    color: #1e293b;
}}
.tech-pill strong {{
    display: block;
    font-size: 21px;
    margin-bottom: 2px;
}}
.bus-bar {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    background: #002060;
    border-radius: 14px;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0,32,96,0.15);
}}
.bus-bar span.arrow {{
    color: #fbbf24;
    font-size: 24px;
}}
</style>
</head>
<body>
<div class="diagram-canvas">
    <div class="header-row">
        <div class="title-group">
            <h2>KrushikaDhara: End-to-End 5-Tier Full-Stack Architecture</h2>
            <p>Modular High-Availability Distributed Pipeline for Smallholder Precision Agriculture</p>
        </div>
        <div class="header-badge">Production Architecture</div>
    </div>
    
    <div class="grid-5">
        <!-- Tier 1 -->
        <div class="tier-card" style="border-color: #059669;">
            <div class="tier-head" style="background: #059669;">
                <div class="tier-head-title">Tier 1: Client App</div>
                <div class="tier-head-sub">Mobile Android APK & Web PWA</div>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">React Native 0.88</strong>
                    Expo SDK 58 Core Platform
                </div>
                <div class="tech-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">Camera & Microphone</strong>
                    16kHz PCM Stream Ingestion
                </div>
                <div class="tech-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">AsyncStorage Cache</strong>
                    Offline-First Local Storage
                </div>
                <div class="tech-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">Kannada Vernacular</strong>
                    Zero-Literacy Audio/Visual UI
                </div>
            </div>
        </div>

        <!-- Tier 2 -->
        <div class="tier-card" style="border-color: #d97706;">
            <div class="tier-head" style="background: #d97706;">
                <div class="tier-head-title">Tier 2: Edge AI</div>
                <div class="tier-head-sub">On-Device Neural Engine</div>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">YOLO11s INT8 TFLite</strong>
                    14.2MB Quantized Model
                </div>
                <div class="tech-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">340ms Inference Speed</strong>
                    Hardware NNAPI Acceleration
                </div>
                <div class="tech-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">102 Pest Classes</strong>
                    Zero-Server Cloud Latency
                </div>
                <div class="tech-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">100% Offline Ready</strong>
                    Operates without SIM or 4G
                </div>
            </div>
        </div>

        <!-- Tier 3 -->
        <div class="tier-card" style="border-color: #2563eb;">
            <div class="tier-head" style="background: #2563eb;">
                <div class="tier-head-title">Tier 3: Cloud Gateway</div>
                <div class="tier-head-sub">Docker Microservice on Render</div>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Node.js 22 LTS</strong>
                    Express REST Microservices
                </div>
                <div class="tech-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Docker Container</strong>
                    Render Managed Auto-Scale
                </div>
                <div class="tech-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">JWT & Rate Limiting</strong>
                    TLS SSL Secure Communication
                </div>
                <div class="tech-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Gzip Payload Opt</strong>
                    Low Rural Bandwidth Tuning
                </div>
            </div>
        </div>

        <!-- Tier 4 -->
        <div class="tier-card" style="border-color: #7c3aed;">
            <div class="tier-head" style="background: #7c3aed;">
                <div class="tier-head-title">Tier 4: Multimodal AI</div>
                <div class="tier-head-sub">Cloud Vision & Voice Reasoning</div>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Gemini 2.5 Flash</strong>
                    Foliar Blight & NPK Deficiency
                </div>
                <div class="tech-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Sarvam AI saaras:v2</strong>
                    Dialect-Resilient Kannada STT
                </div>
                <div class="tech-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Sarvam AI Bulbul</strong>
                    Natural Synthesized Kannada TTS
                </div>
                <div class="tech-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Stage Prompt Engine</strong>
                    Injects Crop Age (Day 35)
                </div>
            </div>
        </div>

        <!-- Tier 5 -->
        <div class="tier-card" style="border-color: #0891b2;">
            <div class="tier-head" style="background: #0891b2;">
                <div class="tier-head-title">Tier 5: Persistence</div>
                <div class="tier-head-sub">Serverless DB & Live Feeds</div>
            </div>
            <div class="tier-body">
                <div class="tech-pill" style="border-color: #0891b2;">
                    <strong style="color: #155e75;">Neon PostgreSQL 16</strong>
                    Auto-Scaling Serverless DB
                </div>
                <div class="tech-pill" style="border-color: #0891b2;">
                    <strong style="color: #155e75;">Prisma ORM 5.x</strong>
                    Type-Safe Schema & Pooling
                </div>
                <div class="tech-pill" style="border-color: #0891b2;">
                    <strong style="color: #155e75;">Agmarknet Mandi Telemetry</strong>
                    31 Districts Live Modal Rates
                </div>
                <div class="tech-pill" style="border-color: #0891b2;">
                    <strong style="color: #155e75;">Open-Meteo Weather</strong>
                    Growing Degree Days (GDD)
                </div>
            </div>
        </div>
    </div>

    <div class="bus-bar">
        <span>📱 Mobile Client</span>
        <span class="arrow">⇄ 340ms NNAPI ⇄</span>
        <span>⚡ On-Device TFLite</span>
        <span class="arrow">⇄ HTTPS REST ⇄</span>
        <span>🌐 Cloud Gateway</span>
        <span class="arrow">⇄ LLM Inference ⇄</span>
        <span>🧠 Gemini + Sarvam</span>
        <span class="arrow">⇄ SQL Pool ⇄</span>
        <span>💾 Neon PostgreSQL</span>
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
{COMMON_CSS}
.pipe-flow {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex: 1;
    margin-bottom: 18px;
}}
.pipe-card {{
    background: #ffffff;
    border-radius: 18px;
    border: 2.5px solid #cbd5e1;
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 6px 16px rgba(0,0,0,0.04);
    overflow: hidden;
}}
.pipe-head {{
    padding: 16px;
    color: #ffffff;
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.5px;
}}
.pipe-body {{
    padding: 18px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
    background: #ffffff;
}}
.pipe-pill {{
    background: #f8fafc;
    border-left: 5px solid;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 18px;
    line-height: 1.35;
    color: #1e293b;
}}
.pipe-pill strong {{
    display: block;
    font-size: 20px;
    margin-bottom: 2px;
}}
.connector {{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
    color: #002060;
    width: 32px;
}}
.decision-box {{
    background: #fffbeb;
    border: 3px dashed #d97706;
    border-radius: 18px;
    width: 290px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(217,119,6,0.08);
}}
.decision-title {{
    font-size: 23px;
    font-weight: 900;
    color: #b45309;
    text-transform: uppercase;
    margin-bottom: 12px;
}}
.decision-rule {{
    background: #ffffff;
    border: 1.5px solid #fde68a;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 19px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #78350f;
    width: 100%;
}}
.bottom-summary-strip {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    background: #059669;
    border-radius: 14px;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(5,150,105,0.15);
}}
</style>
</head>
<body>
<div class="diagram-canvas">
    <div class="header-row">
        <div class="title-group">
            <h2>Two-Stage Computer Vision & Foliar Pathology Diagnostic Pipeline</h2>
            <p>Edge YOLO11s (340ms Local) Combined with Cloud Gemini Multimodal Plant Pathology</p>
        </div>
        <div class="header-badge">Hybrid Vision Flow</div>
    </div>

    <div class="pipe-flow">
        <!-- Step 1 -->
        <div class="pipe-card" style="border-color: #475569;">
            <div class="pipe-head" style="background: #475569;">
                1. Image Ingestion
            </div>
            <div class="pipe-body">
                <div class="pipe-pill" style="border-color: #475569;">
                    <strong style="color: #1e293b;">Camera / Gallery</strong>
                    Real-time field photo capture
                </div>
                <div class="pipe-pill" style="border-color: #475569;">
                    <strong style="color: #1e293b;">Letterbox Resize</strong>
                    640 × 640 fixed tensor dimension
                </div>
                <div class="pipe-pill" style="border-color: #475569;">
                    <strong style="color: #1e293b;">Normalization</strong>
                    RGB / 255.0 floating-point
                </div>
            </div>
        </div>

        <div class="connector">➔</div>

        <!-- Step 2 -->
        <div class="pipe-card" style="border-color: #059669;">
            <div class="pipe-head" style="background: #059669;">
                2. Stage 1: Edge YOLO11s
            </div>
            <div class="pipe-body">
                <div class="pipe-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">INT8 Quantized</strong>
                    14.2MB model on device
                </div>
                <div class="pipe-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">340ms Inference</strong>
                    Hardware NNAPI execution
                </div>
                <div class="pipe-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">102 Pest Species</strong>
                    Stem borer, blast, hoppers, rust
                </div>
            </div>
        </div>

        <div class="connector">➔</div>

        <!-- Decision Box -->
        <div class="decision-box">
            <div class="decision-title">Confidence Gate</div>
            <div class="decision-rule">
                Confidence ≥ 85%?<br>
                <span style="color: #059669; font-size: 21px;">✔ Immediate Local Rx</span>
            </div>
            <div class="decision-rule">
                Ambiguous / Blight?<br>
                <span style="color: #dc2626; font-size: 21px;">✖ Escalate to Cloud</span>
            </div>
        </div>

        <div class="connector">➔</div>

        <!-- Step 3 -->
        <div class="pipe-card" style="border-color: #7c3aed;">
            <div class="pipe-head" style="background: #7c3aed;">
                3. Stage 2: Gemini Vision
            </div>
            <div class="pipe-body">
                <div class="pipe-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Gemini 2.5 Flash</strong>
                    Foliar necrosis & leaf lesions
                </div>
                <div class="pipe-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">NPK Chlorosis</strong>
                    Nitrogen / Zinc deficiency logic
                </div>
                <div class="pipe-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Bio-Pesticide Rx</strong>
                    Localized Kannada dosage cards
                </div>
            </div>
        </div>

        <div class="connector">➔</div>

        <!-- Step 4 -->
        <div class="pipe-card" style="border-color: #0284c7;">
            <div class="pipe-head" style="background: #0284c7;">
                4. Offline Fallback
            </div>
            <div class="pipe-body">
                <div class="pipe-pill" style="border-color: #0284c7;">
                    <strong style="color: #0369a1;">Embedded Database</strong>
                    Pre-cached UAS treatment guide
                </div>
                <div class="pipe-pill" style="border-color: #0284c7;">
                    <strong style="color: #0369a1;">100% Zero-Network</strong>
                    Unbroken agricultural diagnostic
                </div>
                <div class="pipe-pill" style="border-color: #0284c7;">
                    <strong style="color: #0369a1;">Safe Chemical Dosages</strong>
                    REI & PPE safety advisories
                </div>
            </div>
        </div>
    </div>

    <div class="bottom-summary-strip">
        <span>⚡ 340ms Edge Inference Speed</span>
        <span>•</span>
        <span>🎯 91.4% mAP@0.5 Detection Precision</span>
        <span>•</span>
        <span>🛡️ 100% Offline Operational Fallback</span>
        <span>•</span>
        <span>🌿 UAS Bengaluru Verified Agronomy</span>
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
{COMMON_CSS}
.v-grid {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    flex: 1;
    margin-bottom: 18px;
}}
.v-card {{
    background: #ffffff;
    border-radius: 18px;
    border: 2.5px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 6px 16px rgba(0,0,0,0.04);
    overflow: hidden;
}}
.v-head {{
    padding: 16px;
    color: #ffffff;
    font-size: 22px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.v-body {{
    padding: 18px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
    background: #ffffff;
}}
.v-pill {{
    background: #f8fafc;
    border-left: 5px solid;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 18px;
    line-height: 1.35;
    color: #1e293b;
}}
.v-pill strong {{
    display: block;
    font-size: 20px;
    margin-bottom: 2px;
}}
.voice-footer-bar {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    background: #7c3aed;
    border-radius: 14px;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(124,58,237,0.15);
}}
</style>
</head>
<body>
<div class="diagram-canvas">
    <div class="header-row">
        <div class="title-group">
            <h2>Bilingual Voice Agronomist: Dialogue & Reasoning Engine</h2>
            <p>Conversational Kannada & English Agricultural Advisory with Physiological Stage Context Injection</p>
        </div>
        <div class="header-badge">Conversational AI</div>
    </div>

    <div class="v-grid">
        <!-- 1 -->
        <div class="v-card" style="border-color: #dc2626;">
            <div class="v-head" style="background: #dc2626;">
                1. Voice Capture
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong style="color: #991b1b;">Farmer Speech</strong>
                    Kannada or Indian-English query
                </div>
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong style="color: #991b1b;">Expo Audio Stream</strong>
                    16kHz PCM mono WAV capture
                </div>
                <div class="v-pill" style="border-color: #dc2626;">
                    <strong style="color: #991b1b;">Waveform Animation</strong>
                    60fps visual audio feedback
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
                    <strong style="color: #92400e;">saaras:v2 Model</strong>
                    State-of-the-art Indic ASR
                </div>
                <div class="v-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">Dialect Resilient</strong>
                    Mandya / Mysuru colloquial idioms
                </div>
                <div class="v-pill" style="border-color: #d97706;">
                    <strong style="color: #92400e;">Unicode Kannada</strong>
                    Accurate text token generation
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
                    <strong style="color: #065f46;">Farmer Identity</strong>
                    Naveen Kumar KM profile
                </div>
                <div class="v-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">Active Crop & Age</strong>
                    Rice (Paddy), Sowing Day 35
                </div>
                <div class="v-pill" style="border-color: #059669;">
                    <strong style="color: #065f46;">Physiological Stage</strong>
                    Tillering & Vegetative growth
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
                    <strong style="color: #5b21b6;">Agronomic Reasoning</strong>
                    UAS Package of Practices guide
                </div>
                <div class="v-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Stage Prescription</strong>
                    Accurate fertilizer split dosage
                </div>
                <div class="v-pill" style="border-color: #7c3aed;">
                    <strong style="color: #5b21b6;">Structured JSON</strong>
                    Clean bilingual advisory payload
                </div>
            </div>
        </div>

        <!-- 5 -->
        <div class="v-card" style="border-color: #2563eb;">
            <div class="v-head" style="background: #2563eb;">
                5. Dual Output
            </div>
            <div class="v-body">
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Sarvam AI TTS</strong>
                    Natural human-like Kannada audio
                </div>
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Interactive UI Card</strong>
                    Actionable dosage checklist
                </div>
                <div class="v-pill" style="border-color: #2563eb;">
                    <strong style="color: #1e40af;">Web Speech Fallback</strong>
                    Zero-cost browser playback
                </div>
            </div>
        </div>
    </div>

    <div class="voice-footer-bar">
        <span>🎙️ 620ms Total Voice Turnaround</span>
        <span>•</span>
        <span>🗣️ 100% Native Kannada Speech & Audio</span>
        <span>•</span>
        <span>🌱 Stage-Aware Context Injection</span>
        <span>•</span>
        <span>📱 Zero Typing Required</span>
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
{COMMON_CSS}
.stage-timeline {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    flex: 1;
    margin-bottom: 18px;
}}
.st-card {{
    background: #ffffff;
    border-radius: 18px;
    border: 2.5px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 6px 16px rgba(0,0,0,0.04);
    overflow: hidden;
}}
.st-head {{
    padding: 16px 12px;
    color: #ffffff;
    text-align: center;
}}
.st-head-badge {{
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    background: rgba(0,0,0,0.2);
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    margin-bottom: 6px;
}}
.st-head-title {{
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
}}
.st-body {{
    padding: 18px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
    background: #ffffff;
}}
.st-pill {{
    background: #f8fafc;
    border-left: 5px solid;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 17.5px;
    line-height: 1.35;
    color: #1e293b;
}}
.st-pill strong {{
    display: block;
    font-size: 19.5px;
    margin-bottom: 2px;
}}
.mandi-strip {{
    background: #ecfdf5;
    border: 2.5px solid #10b981;
    border-radius: 18px;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 6px 16px rgba(16,185,129,0.1);
}}
.mandi-title-group h3 {{
    font-size: 26px;
    font-weight: 900;
    color: #065f46;
}}
.mandi-title-group p {{
    font-size: 19px;
    font-weight: 600;
    color: #047857;
    margin-top: 2px;
}}
.mandi-chips {{
    display: flex;
    gap: 12px;
}}
.mandi-chip {{
    background: #ffffff;
    border: 2px solid #34d399;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 800;
    color: #065f46;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}}
</style>
</head>
<body>
<div class="diagram-canvas">
    <div class="header-row">
        <div class="title-group">
            <h2>5-Stage Crop Lifecycle Progression & Statewide APMC Mandi Telemetry</h2>
            <p>Chronological Crop Health Monitoring Aligned with Real-Time Karnataka Market Prices</p>
        </div>
        <div class="header-badge">Crop Lifecycle & APMC</div>
    </div>

    <div class="stage-timeline">
        <!-- Stage 1 -->
        <div class="st-card" style="border-color: #84cc16;">
            <div class="st-head" style="background: #65a30d;">
                <div class="st-head-badge">Day 0 – 15</div>
                <div class="st-head-title">1. Land Prep</div>
            </div>
            <div class="st-body">
                <div class="st-pill" style="border-color: #65a30d;">
                    <strong style="color: #4d7c0f;">Soil Tillage</strong>
                    Deep summer ploughing & leveling
                </div>
                <div class="st-pill" style="border-color: #65a30d;">
                    <strong style="color: #4d7c0f;">Basal FYM</strong>
                    10 tons/ha organic manure + bio-NPK
                </div>
                <div class="st-pill" style="border-color: #65a30d;">
                    <strong style="color: #4d7c0f;">Seed Treatment</strong>
                    Pseudomonas fluorescens slurry
                </div>
            </div>
        </div>

        <!-- Stage 2 -->
        <div class="st-card" style="border-color: #10b981;">
            <div class="st-head" style="background: #059669;">
                <div class="st-head-badge">Day 16 – 45</div>
                <div class="st-head-title">2. Tillering</div>
            </div>
            <div class="st-body">
                <div class="st-pill" style="border-color: #059669;">
                    <strong style="color: #047857;">Vegetative Boost</strong>
                    Urea (25kg) + MOP (10kg) split
                </div>
                <div class="st-pill" style="border-color: #059669;">
                    <strong style="color: #047857;">Cono-Weeder</strong>
                    Inter-culture soil aeration
                </div>
                <div class="st-pill" style="border-color: #059669;">
                    <strong style="color: #047857;">Pest Vigilance</strong>
                    Yellow stem borer & whorl maggot
                </div>
            </div>
        </div>

        <!-- Stage 3 -->
        <div class="st-card" style="border-color: #06b6d4;">
            <div class="st-head" style="background: #0891b2;">
                <div class="st-head-badge">Day 46 – 75</div>
                <div class="st-head-title">3. Panicle</div>
            </div>
            <div class="st-body">
                <div class="st-pill" style="border-color: #0891b2;">
                    <strong style="color: #0e7490;">Water Depth</strong>
                    Maintain 2–5cm steady ponding
                </div>
                <div class="st-pill" style="border-color: #0891b2;">
                    <strong style="color: #0e7490;">Foliar Sprays</strong>
                    Zinc Sulphate + Boron nutrient spray
                </div>
                <div class="st-pill" style="border-color: #0891b2;">
                    <strong style="color: #0e7490;">Pathology Watch</strong>
                    Neck blast & sheath blight scan
                </div>
            </div>
        </div>

        <!-- Stage 4 -->
        <div class="st-card" style="border-color: #f59e0b;">
            <div class="st-head" style="background: #d97706;">
                <div class="st-head-badge">Day 76 – 105</div>
                <div class="st-head-title">4. Ripening</div>
            </div>
            <div class="st-body">
                <div class="st-pill" style="border-color: #d97706;">
                    <strong style="color: #b45309;">Grain Filling</strong>
                    Milky to dough maturity stage
                </div>
                <div class="st-pill" style="border-color: #d97706;">
                    <strong style="color: #b45309;">Field Drainage</strong>
                    Drain standing water 10d before cut
                </div>
                <div class="st-pill" style="border-color: #d97706;">
                    <strong style="color: #b45309;">Hopper Check</strong>
                    Brown planthopper surveillance
                </div>
            </div>
        </div>

        <!-- Stage 5 -->
        <div class="st-card" style="border-color: #ef4444;">
            <div class="st-head" style="background: #dc2626;">
                <div class="st-head-badge">Day 106 – 120</div>
                <div class="st-head-title">5. Harvest</div>
            </div>
            <div class="st-body">
                <div class="st-pill" style="border-color: #dc2626;">
                    <strong style="color: #b91c1c;">85% Golden Panicle</strong>
                    Optimal physiological maturity
                </div>
                <div class="st-pill" style="border-color: #dc2626;">
                    <strong style="color: #b91c1c;">Sun Drying</strong>
                    Dry grain to &lt;14% moisture
                </div>
                <div class="st-pill" style="border-color: #dc2626;">
                    <strong style="color: #b91c1c;">APMC Sale</strong>
                    Agmarknet mandi market dispatch
                </div>
            </div>
        </div>
    </div>

    <div class="mandi-strip">
        <div class="mandi-title-group">
            <h3>🌾 Statewide Real-Time APMC Mandi Telemetry (Agmarknet)</h3>
            <p>Live daily arrivals, modal prices, and mandi price trend forecasting across 31 Karnataka APMCs</p>
        </div>
        <div class="mandi-chips">
            <span class="mandi-chip">📍 Mandya: ₹2,450/qtl</span>
            <span class="mandi-chip">📍 Mysuru: ₹3,100/qtl</span>
            <span class="mandi-chip">📍 Ramanagara: ₹1,850/qtl</span>
            <span class="mandi-chip">📍 Kolar: ₹16,500/qtl</span>
        </div>
    </div>
</div>
</body>
</html>
"""

# HTML for Slide 14 Showcase
HTML_SHOWCASE = f"""
<!DOCTYPE html>
<html>
<head>
<style>
{COMMON_CSS}
.showcase-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    flex: 1;
    margin-bottom: 16px;
    align-items: stretch;
}}
.phone-col {{
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 20px;
    border: 2.5px solid #cbd5e1;
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    overflow: hidden;
}}
.phone-top-bar {{
    padding: 14px 18px;
    color: #ffffff;
    font-size: 21px;
    font-weight: 900;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}
.phone-img-wrap {{
    flex: 1;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    position: relative;
    overflow: hidden;
}}
.phone-img {{
    max-height: 580px;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border: 3px solid #334155;
}}
.phone-desc {{
    padding: 14px 18px;
    background: #ffffff;
    border-top: 1.5px solid #e2e8f0;
    font-size: 18px;
    line-height: 1.4;
    color: #334155;
}}
.phone-desc strong {{
    display: block;
    color: #0f172a;
    font-size: 20px;
    margin-bottom: 4px;
}}
.highlight-pill {{
    display: inline-block;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 800;
    margin-top: 6px;
}}
.validation-strip {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    background: #002060;
    border-radius: 14px;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0,32,96,0.15);
}}
</style>
</head>
<body>
<div class="diagram-canvas">
    <div class="header-row">
        <div class="title-group">
            <h2>Live System Implementation & Physical Android Device Verification</h2>
            <p>Validated on Physical Motorola Edge 50 Fusion (Snapdragon 7s Gen 2, 8GB RAM, Android 14)</p>
        </div>
        <div class="header-badge">Physical Hardware Demo</div>
    </div>

    <div class="showcase-grid">
        <!-- Screen 1 -->
        <div class="phone-col">
            <div class="phone-top-bar" style="background: #059669;">
                <span>Fig 6.1: Microclimate & Stage Home</span>
                <span>📱 Live</span>
            </div>
            <div class="phone-img-wrap">
                <img class="phone-img" src="file:///{os.path.join(assets_dir, '01-home-dashboard.png').replace(chr(92), '/')}" />
            </div>
            <div class="phone-desc">
                <strong>Instant Weather Telemetry & Stage Checklist</strong>
                Real-time Mandya weather (30.8°C, 57% humidity) + thermal GDD calculation. Tracks Rice Sona Masoori Day 35 Tillering with daily fertilizer split-dose guidance.
                <div class="highlight-pill" style="background: #dcfce7; color: #166534;">
                    ✔ GDD Growth Tracker · UAS Bengaluru Package of Practice
                </div>
            </div>
        </div>

        <!-- Screen 2 -->
        <div class="phone-col">
            <div class="phone-top-bar" style="background: #d97706;">
                <span>Fig 6.2: Edge Pest Vision Scan</span>
                <span>⚡ 340ms</span>
            </div>
            <div class="phone-img-wrap">
                <img class="phone-img" src="file:///{os.path.join(assets_dir, '02-pest-scan.png').replace(chr(92), '/')}" />
            </div>
            <div class="phone-desc">
                <strong>Zero-Server Offline Bounding-Box Detection</strong>
                INT8 quantized YOLO11s TFLite neural model executing locally in 340ms. Detects 102 pest species with camera viewfinder bounding-box guidance and zero server roundtrip.
                <div class="highlight-pill" style="background: #fef3c7; color: #92400e;">
                    ✔ 102 Pest Classes · 91.4% mAP@0.5 · 100% Offline
                </div>
            </div>
        </div>

        <!-- Screen 3 -->
        <div class="phone-col">
            <div class="phone-top-bar" style="background: #2563eb;">
                <span>Fig 6.3: Statewide APMC Mandi</span>
                <span>📊 Live Feed</span>
            </div>
            <div class="phone-img-wrap">
                <img class="phone-img" src="file:///{os.path.join(assets_dir, '03-mandi-market.png').replace(chr(92), '/')}" />
            </div>
            <div class="phone-desc">
                <strong>Statewide APMC Mandi Market Telemetry</strong>
                Automated daily Agmarknet price synchronization across all 31 Karnataka APMCs. Displays real-time minimum, maximum, and modal wholesale rates to bypass middleman exploitation.
                <div class="highlight-pill" style="background: #dbeafe; color: #1e40af;">
                    ✔ 31 Karnataka Districts · Daily Wholesale Modal Trends
                </div>
            </div>
        </div>
    </div>

    <div class="validation-strip">
        <span>📱 Hardware: Snapdragon 7s Gen 2</span>
        <span>•</span>
        <span>⏱️ Edge Latency: 340ms Local</span>
        <span>•</span>
        <span>🛡️ Offline Fallback: 100% Durability</span>
        <span>•</span>
        <span>🌐 Admin: Vercel 60fps Studio</span>
    </div>
</div>
</body>
</html>
"""

async def generate():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Viewport 2400x1150 with device_scale_factor=2 -> 4800x2300 Retina Ultra-HD!
        page = await browser.new_page(viewport={"width": 2400, "height": 1150}, device_scale_factor=2)

        items = [
            ("arch_diagram.png", HTML_ARCH),
            ("pipeline_diagram.png", HTML_PIPELINE),
            ("voice_diagram.png", HTML_VOICE),
            ("lifecycle_diagram.png", HTML_LIFECYCLE),
            ("live_showcase.png", HTML_SHOWCASE),
        ]

        for filename, html in items:
            await page.set_content(html)
            path = os.path.join(assets_dir, filename)
            await page.screenshot(path=path)
            print(f"✅ Generated Ultra-HD Retina Canvas: {path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(generate())
