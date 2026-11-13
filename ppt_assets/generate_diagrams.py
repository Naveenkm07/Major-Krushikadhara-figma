import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

out_dir = r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\ppt_assets'
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. System Architecture Flow Diagram
# -------------------------------------------------------------
def make_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.8), dpi=200)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)
    ax.axis('off')

    bg = patches.FancyBboxPatch((0.1, 0.1), 9.8, 4.8, boxstyle='round,pad=0.05', facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(bg)

    ax.text(5, 4.55, "KRUSHIKADHARA: END-TO-END 5-TIER SYSTEM ARCHITECTURE", ha='center', va='center', fontsize=12, fontweight='bold', color='#002060')

    tiers = [
        ("TIER 1: CLIENT APP", ["React Native 0.88", "Expo SDK 58", "Camera & Audio UI", "Local SQLite Cache"], 0.4, '#e0f2fe', '#0284c7'),
        ("TIER 2: EDGE AI", ["YOLO11s TFLite", "640x640 Input", "102 Pest Classes", "340ms Inference"], 2.3, '#fef3c7', '#d97706'),
        ("TIER 3: CLOUD REST API", ["Node.js 22 + Express", "Docker on Render", "JWT Auth & Rate Limit", "Agro-Routing API"], 4.2, '#dcfce7', '#16a34a'),
        ("TIER 4: AI REASONING", ["Gemini Vision", "Sarvam Kannada STT", "Foliar Pathology", "Contextual Agronomy"], 6.1, '#f3e8ff', '#9333ea'),
        ("TIER 5: STORAGE & ADMIN", ["Neon PostgreSQL 16", "Prisma ORM", "Cloudinary CDN", "Vercel Admin Portal"], 8.0, '#ffe4e6', '#e11d48'),
    ]

    for title, items, x, fcolor, bcolor in tiers:
        box = patches.FancyBboxPatch((x, 0.6), 1.6, 3.6, boxstyle='round,pad=0.08', facecolor=fcolor, edgecolor=bcolor, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 0.8, 3.9, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color=bcolor)
        
        for idx, it in enumerate(items):
            ibox = patches.FancyBboxPatch((x + 0.1, 2.8 - idx * 0.7), 1.4, 0.55, boxstyle='round,pad=0.04', facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1)
            ax.add_patch(ibox)
            ax.text(x + 0.8, 3.08 - idx * 0.7, it, ha='center', va='center', fontsize=7, color='#1e293b', fontweight='medium')

    arrows = [(2.0, 2.4, 2.3, 2.4), (3.9, 2.4, 4.2, 2.4), (5.8, 2.4, 6.1, 2.4), (7.7, 2.4, 8.0, 2.4)]
    for x1, y1, x2, y2 in arrows:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="<->", color='#0f172a', lw=1.8, shrinkA=0, shrinkB=0))

    out_file = os.path.join(out_dir, 'arch_diagram.png')
    plt.tight_layout()
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print("Saved arch_diagram.png")

# -------------------------------------------------------------
# 2. Two-Stage Diagnostic Pipeline Diagram
# -------------------------------------------------------------
def make_diagnostic_pipeline_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.4), dpi=200)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.4)
    ax.axis('off')

    bg = patches.FancyBboxPatch((0.1, 0.1), 9.8, 4.2, boxstyle='round,pad=0.05', facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(bg)
    ax.text(5, 4.05, "TWO-STAGE HYBRID COMPUTER VISION DIAGNOSTIC PIPELINE", ha='center', va='center', fontsize=11, fontweight='bold', color='#002060')

    steps = [
        ("1. Input Capture", "Mobile Camera\n(Farmer Field)", 0.4, 2.1, '#e2e8f0', '#475569'),
        ("2. Pre-processing", "640x640 Letterbox\nEXIF Normalization", 2.2, 2.1, '#e0e7ff', '#4338ca'),
        ("3. Edge YOLO11s", "INT8 Quantized TFLite\n102 Pest Classes (340ms)", 4.0, 2.1, '#fef08a', '#ca8a04'),
        ("4A. Pest Detected?", "Bounding Box Overlay\nSeverity & Dosages", 6.2, 2.9, '#fee2e2', '#dc2626'),
        ("4B. Leaf Blight?", "Gemini Vision Pathology\nFungal & Nutrient (N,P,K)", 6.2, 1.3, '#ccfbf1', '#0d9488'),
        ("5. Farmer Advisory", "Bilingual Remedy Output\n(Organic + Chemical)", 8.4, 2.1, '#dcfce7', '#16a34a')
    ]

    for title, desc, x, y, fc, ec in steps:
        box = patches.FancyBboxPatch((x, y - 0.45), 1.45, 0.9, boxstyle='round,pad=0.08', facecolor=fc, edgecolor=ec, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 0.725, y + 0.22, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color=ec)
        ax.text(x + 0.725, y - 0.12, desc, ha='center', va='center', fontsize=6.5, color='#1e293b')

    ax.annotate('', xy=(2.2, 2.1), xytext=(1.85, 2.1), arrowprops=dict(arrowstyle="->", color='#334155', lw=1.5))
    ax.annotate('', xy=(4.0, 2.1), xytext=(3.65, 2.1), arrowprops=dict(arrowstyle="->", color='#334155', lw=1.5))
    ax.annotate('', xy=(6.2, 2.9), xytext=(5.45, 2.3), arrowprops=dict(arrowstyle="->", color='#dc2626', lw=1.5))
    ax.annotate('', xy=(6.2, 1.3), xytext=(5.45, 1.9), arrowprops=dict(arrowstyle="->", color='#0d9488', lw=1.5))
    ax.annotate('', xy=(8.4, 2.2), xytext=(7.65, 2.9), arrowprops=dict(arrowstyle="->", color='#16a34a', lw=1.5))
    ax.annotate('', xy=(8.4, 2.0), xytext=(7.65, 1.3), arrowprops=dict(arrowstyle="->", color='#16a34a', lw=1.5))

    out_file = os.path.join(out_dir, 'pipeline_diagram.png')
    plt.tight_layout()
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print("Saved pipeline_diagram.png")

# -------------------------------------------------------------
# 3. Kannada Voice Agronomist Flow Diagram
# -------------------------------------------------------------
def make_voice_agronomist_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.0), dpi=200)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.0)
    ax.axis('off')

    bg = patches.FancyBboxPatch((0.1, 0.1), 9.8, 3.8, boxstyle='round,pad=0.05', facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(bg)
    ax.text(5, 3.65, "CONVERSATIONAL KANNADA VOICE AGRONOMIST PIPELINE", ha='center', va='center', fontsize=11, fontweight='bold', color='#002060')

    v_steps = [
        ("Spoken Query", "Farmer speaks\nin Kannada/English", 0.4, '#e0f2fe', '#0284c7'),
        ("Audio Buffer", "Expo Audio Stream\n16kHz PCM Buffer", 2.0, '#fef3c7', '#d97706'),
        ("Sarvam AI STT", "Kannada ASR Model\nAccurate Transcription", 3.6, '#f3e8ff', '#9333ea'),
        ("Context Binder", "Crop + Sowing Date\nAge + Growth Stage", 5.2, '#ffe4e6', '#e11d48'),
        ("Gemini LLM", "Agronomic Reasoning\nDosages per 15L Pump", 6.8, '#dcfce7', '#16a34a'),
        ("Audio Output", "Vernacular Speech\n& Interactive Cards", 8.4, '#ccfbf1', '#0d9488')
    ]

    for title, desc, x, fc, ec in v_steps:
        box = patches.FancyBboxPatch((x, 0.9), 1.25, 2.3, boxstyle='round,pad=0.08', facecolor=fc, edgecolor=ec, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 0.625, 2.8, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color=ec)
        ax.text(x + 0.625, 1.8, desc, ha='center', va='center', fontsize=6.8, color='#1e293b')

    for i in range(5):
        x1 = 0.4 + i * 1.6 + 1.25
        x2 = 0.4 + (i + 1) * 1.6
        ax.annotate('', xy=(x2, 2.0), xytext=(x1, 2.0), arrowprops=dict(arrowstyle="->", color='#334155', lw=1.5))

    out_file = os.path.join(out_dir, 'voice_diagram.png')
    plt.tight_layout()
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print("Saved voice_diagram.png")

# -------------------------------------------------------------
# 4. 5-Stage Crop Lifecycle Timeline Diagram
# -------------------------------------------------------------
def make_lifecycle_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.0), dpi=200)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.0)
    ax.axis('off')

    bg = patches.FancyBboxPatch((0.1, 0.1), 9.8, 3.8, boxstyle='round,pad=0.05', facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(bg)
    ax.text(5, 3.65, "DYNAMIC 32+ CROP LIFECYCLE PROGRESSION (5 PHYSIOLOGICAL STAGES)", ha='center', va='center', fontsize=11, fontweight='bold', color='#002060')

    stages = [
        ("STAGE 1", "Land Prep (0-15d)", "Deep Ploughing\nFYM & Basal N:P:K\nSoil Solarization", 0.4, '#e0e7ff', '#4338ca'),
        ("STAGE 2", "Sowing (16-35d)", "Seed Treatment\nTrichoderma Viride\nWeed Management", 2.3, '#fef08a', '#ca8a04'),
        ("STAGE 3", "Tillering (36-60d)", "Urea Top-Dressing\nStem Borer Check\nWater Level 2-5cm", 4.2, '#dcfce7', '#16a34a'),
        ("STAGE 4", "Panicle (61-90d)", "MOP Application\nBlast Prevention\nFlag Leaf Protection", 6.1, '#fed7aa', '#ea580c'),
        ("STAGE 5", "Harvest (91-120d)", "Irrigation Cutoff\nMoisture < 14%\nYield Logging", 8.0, '#fbcfe8', '#db2777')
    ]

    for st_num, st_name, tasks, x, fc, ec in stages:
        box = patches.FancyBboxPatch((x, 0.6), 1.6, 2.7, boxstyle='round,pad=0.08', facecolor=fc, edgecolor=ec, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 0.8, 2.95, st_num, ha='center', va='center', fontsize=8, fontweight='bold', color=ec)
        ax.text(x + 0.8, 2.6, st_name, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#1e293b')
        ax.text(x + 0.8, 1.55, tasks, ha='center', va='center', fontsize=6.8, color='#334155')

    for i in range(4):
        x1 = 0.4 + i * 1.9 + 1.6
        x2 = 0.4 + (i + 1) * 1.9
        ax.annotate('', xy=(x2, 1.95), xytext=(x1, 1.95), arrowprops=dict(arrowstyle="->", color='#334155', lw=1.5))

    out_file = os.path.join(out_dir, 'lifecycle_diagram.png')
    plt.tight_layout()
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print("Saved lifecycle_diagram.png")

make_architecture_diagram()
make_diagnostic_pipeline_diagram()
make_voice_agronomist_diagram()
make_lifecycle_diagram()
print("All 4 diagrams generated successfully on Drive Z!")
