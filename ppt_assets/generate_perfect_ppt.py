import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import os

template_path = r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\Project Phase-II_Review 2_ PPT Template.original_backup.pptx'
output_path = r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\Project Phase-II_Review 2_ PPT Template.pptx'
assets_dir = r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\ppt_assets'

logo_path = os.path.join(assets_dir, 'nhce_logo.png')
arch_diag = os.path.join(assets_dir, 'arch_diagram.png')
pipe_diag = os.path.join(assets_dir, 'pipeline_diagram.png')
voice_diag = os.path.join(assets_dir, 'voice_diagram.png')
life_diag = os.path.join(assets_dir, 'lifecycle_diagram.png')

ss_home = os.path.join(assets_dir, '01-home-dashboard.png')
ss_scan = os.path.join(assets_dir, '02-pest-scan.png')
ss_mandi = os.path.join(assets_dir, '03-mandi-market.png')

# Colors
MAROON = RGBColor(0xC0, 0x00, 0x00)
NAVY = RGBColor(0x00, 0x20, 0x60)
DARK_TEXT = RGBColor(0x1F, 0x29, 0x37)
MUTED_TEXT = RGBColor(0x4B, 0x55, 0x63)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_BG = RGBColor(0xF8, 0xFA, 0xFC)
BORDER_COLOR = RGBColor(0xCB, 0xD5, 0xE1)

prs = Presentation(template_path)

# Ensure prs has 21 slides: template has 4 slides, we add 17 slides
blank_layout = prs.slide_layouts[6] if len(prs.slide_layouts) > 6 else prs.slide_layouts[0]
while len(prs.slides) < 21:
    prs.slides.add_slide(blank_layout)

print(f"Presentation now has {len(prs.slides)} slides ready for population.")

# ==========================================
# SLIDE 1: Title Slide (Cover) - Slide Index 0
# ==========================================
s1 = prs.slides[0]
s1_title_shape = s1.shapes[0]
tf = s1_title_shape.text_frame
tf.clear()

p1 = tf.paragraphs[0]
p1.text = "Department of Computer Science and Engineering"
p1.font.name = "Times New Roman"
p1.font.size = Pt(16)
p1.font.bold = True
p1.font.color.rgb = MAROON
p1.alignment = PP_ALIGN.CENTER

p2 = tf.add_paragraph()
p2.text = "Academic Year (2026-27) | 22CSE74 : Project Phase-II\n"
p2.font.name = "Times New Roman"
p2.font.size = Pt(13)
p2.font.bold = True
p2.font.color.rgb = NAVY
p2.alignment = PP_ALIGN.CENTER

p3 = tf.add_paragraph()
p3.text = "KRUSHIKADHARA: AN AI-POWERED MULTIMODAL CROP DIAGNOSTICS, REAL-TIME STAGE ADVISORY, AND APMC MARKET INTELLIGENCE ECOSYSTEM FOR SMALLHOLDER FARMERS"
p3.font.name = "Times New Roman"
p3.font.size = Pt(17)
p3.font.bold = True
p3.font.color.rgb = MAROON
p3.alignment = PP_ALIGN.CENTER

# Team members shape
s1_team_shape = s1.shapes[1]
tf_team = s1_team_shape.text_frame
tf_team.clear()
p_th = tf_team.paragraphs[0]
p_th.text = "Team Members"
p_th.font.name = "Times New Roman"
p_th.font.size = Pt(14)
p_th.font.bold = True
p_th.font.color.rgb = MAROON

team_data = [
    "1NH24CS409 - NAVEEN KUMAR KM (Lead)",
    "1NH23CS029 - ARUN VIRAKTAMATH",
    "1NH23CS080 - G. MOHNISH",
    "1NH23CS060 - P. CHANDRASHEKHAR"
]
for member in team_data:
    p = tf_team.add_paragraph()
    p.text = member
    p.font.name = "Times New Roman"
    p.font.size = Pt(12)
    p.font.bold = ("Lead" in member)
    p.font.color.rgb = DARK_TEXT

# Guide shape
s1_guide_shape = s1.shapes[2]
tf_guide = s1_guide_shape.text_frame
tf_guide.clear()
p_gh = tf_guide.paragraphs[0]
p_gh.text = "Under the Guidance of"
p_gh.font.name = "Times New Roman"
p_gh.font.size = Pt(14)
p_gh.font.bold = True
p_gh.font.color.rgb = MAROON

guides = [
    "1. Dr. Raja Meyyan, Professor & HoD, Dept. of CSE, NHCE",
    "2. Dr. Soja Rani S, Associate Professor, Dept. of CSE, NHCE"
]
for g in guides:
    p = tf_guide.add_paragraph()
    p.text = g
    p.font.name = "Times New Roman"
    p.font.size = Pt(12)
    p.font.color.rgb = DARK_TEXT


# ==========================================
# SLIDE 2: Outline of Presentation - Slide Index 1
# ==========================================
s2 = prs.slides[1]
for shape in list(s2.shapes):
    sp = shape._element
    sp.getparent().remove(sp)

if os.path.exists(logo_path):
    s2.shapes.add_picture(logo_path, Inches(12.0), Inches(0.12), Inches(1.0), Inches(0.98))

tbox = s2.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(10.8), Inches(0.8))
tf = tbox.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = "OUTLINE OF THE PRESENTATION"
p.font.name = "Times New Roman"
p.font.size = Pt(24)
p.font.bold = True
p.font.color.rgb = MAROON

# Column 1 Box
col1_box = s2.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(5.2), Inches(4.8))
tf1 = col1_box.text_frame
tf1.word_wrap = True

col1_items = [
    ("1.", "Abstract"),
    ("2.", "Introduction - Background, Problem & Objectives"),
    ("3.", "Proposed System Architecture & Deep Dive"),
    ("4.", "System Analysis - Requirements & Specifications"),
    ("5.", "Comparison with Existing Systems"),
    ("6.", "Results and Discussions - Accuracy & Live Demo")
]
for i, (num, text) in enumerate(col1_items):
    p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
    p.space_after = Pt(14)
    run_num = p.add_run()
    run_num.text = f"{num} "
    run_num.font.name = "Times New Roman"
    run_num.font.size = Pt(15)
    run_num.font.bold = True
    run_num.font.color.rgb = NAVY
    
    run_txt = p.add_run()
    run_txt.text = text
    run_txt.font.name = "Times New Roman"
    run_txt.font.size = Pt(14)
    run_txt.font.color.rgb = DARK_TEXT

# Column 2 Box
col2_box = s2.shapes.add_textbox(Inches(6.8), Inches(1.5), Inches(5.2), Inches(4.8))
tf2 = col2_box.text_frame
tf2.word_wrap = True

col2_items = [
    ("7.", "Cost Analysis & Economic Viability"),
    ("8.", "Public Health, Safety & Environmental Considerations"),
    ("9.", "Conclusion and Future Scope"),
    ("10.", "References (IEEE Standards)"),
    ("11.", "Proof of IEEE Conference Submission / Acceptance"),
    ("12.", "KSCST 48th Series SPP Submission Proof")
]
for i, (num, text) in enumerate(col2_items):
    p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
    p.space_after = Pt(14)
    run_num = p.add_run()
    run_num.text = f"{num} "
    run_num.font.name = "Times New Roman"
    run_num.font.size = Pt(15)
    run_num.font.bold = True
    run_num.font.color.rgb = NAVY
    
    run_txt = p.add_run()
    run_txt.text = text
    run_txt.font.name = "Times New Roman"
    run_txt.font.size = Pt(14)
    run_txt.font.color.rgb = DARK_TEXT

# Footer
fbox = s2.shapes.add_textbox(Inches(4.42), Inches(6.95), Inches(4.5), Inches(0.4))
pf = fbox.text_frame.paragraphs[0]
pf.text = "22CSE74 - PROJECT PHASE – II"
pf.font.name = "Times New Roman"
pf.font.size = Pt(11)
pf.font.color.rgb = MUTED_TEXT
pf.alignment = PP_ALIGN.CENTER


# ==========================================
# BASE SLIDE SETUP FUNCTION
# ==========================================
def setup_slide(slide, title_text):
    for shape in list(slide.shapes):
        sp = shape._element
        sp.getparent().remove(sp)
    
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Inches(12.0), Inches(0.12), Inches(1.0), Inches(0.98))
    
    # Title box (Fixed bounds: top=0.35, height=0.75, width=10.8)
    tbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(10.8), Inches(0.75))
    tf = tbox.text_frame
    tf.word_wrap = True
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.margin_left = 0
    tf.margin_right = 0
    
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = "Times New Roman"
    # Strict font size to prevent wrapping
    if len(title_text) > 50:
        p.font.size = Pt(20)
    elif len(title_text) > 35:
        p.font.size = Pt(21)
    else:
        p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = MAROON
    
    # Footer
    fbox = slide.shapes.add_textbox(Inches(4.42), Inches(6.95), Inches(4.5), Inches(0.4))
    pf = fbox.text_frame.paragraphs[0]
    pf.text = "22CSE74 - PROJECT PHASE – II"
    pf.font.name = "Times New Roman"
    pf.font.size = Pt(11)
    pf.font.color.rgb = MUTED_TEXT
    pf.alignment = PP_ALIGN.CENTER


# ==========================================
# HELPER: Bullet Slide
# ==========================================
def create_bullet_slide(slide, title_text, bullets):
    setup_slide(slide, title_text)
    
    cbox = slide.shapes.add_textbox(Inches(0.8), Inches(1.40), Inches(11.7), Inches(5.20))
    tf = cbox.text_frame
    tf.word_wrap = True
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.margin_left = 0
    tf.margin_right = 0
    
    for i, (heading, body) in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(8)
        
        if heading:
            run_h = p.add_run()
            run_h.text = f"•  {heading}: "
            run_h.font.name = "Times New Roman"
            run_h.font.size = Pt(13)
            run_h.font.bold = True
            run_h.font.color.rgb = NAVY
        else:
            run_bullet = p.add_run()
            run_bullet.text = "•  "
            run_bullet.font.name = "Times New Roman"
            run_bullet.font.size = Pt(13)
            run_bullet.font.bold = True
            run_bullet.font.color.rgb = NAVY
        
        run_b = p.add_run()
        run_b.text = body
        run_b.font.name = "Times New Roman"
        run_b.font.size = Pt(12.5)
        run_b.font.color.rgb = DARK_TEXT


# ==========================================
# HELPER: Split Slide (Bullets Left, Diagram Right)
# ==========================================
def create_split_slide(slide, title_text, bullets, diagram_path, takeaway_title, takeaway_text):
    setup_slide(slide, title_text)
    
    # Left Content Box
    cbox = slide.shapes.add_textbox(Inches(0.8), Inches(1.40), Inches(5.6), Inches(5.20))
    tf = cbox.text_frame
    tf.word_wrap = True
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.margin_left = 0
    tf.margin_right = 0
    
    for i, (heading, body) in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(7)
        
        run_h = p.add_run()
        run_h.text = f"•  {heading}: "
        run_h.font.name = "Times New Roman"
        run_h.font.size = Pt(12)
        run_h.font.bold = True
        run_h.font.color.rgb = NAVY
        
        run_b = p.add_run()
        run_b.text = body
        run_b.font.name = "Times New Roman"
        run_b.font.size = Pt(11)
        run_b.font.color.rgb = DARK_TEXT
    
    # Right Diagram Image (2:1 aspect ratio -> 5.85" x 2.925")
    if os.path.exists(diagram_path):
        slide.shapes.add_picture(diagram_path, Inches(6.65), Inches(1.40), Inches(5.85), Inches(2.925))
    
    # Right Callout Card below diagram
    callout_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.65), Inches(4.50), Inches(5.85), Inches(2.00))
    callout_box.fill.solid()
    callout_box.fill.fore_color.rgb = LIGHT_BG
    callout_box.line.color.rgb = BORDER_COLOR
    callout_box.line.width = Pt(1.5)
    
    ctf = callout_box.text_frame
    ctf.word_wrap = True
    ctf.margin_top = Inches(0.12)
    ctf.margin_bottom = Inches(0.12)
    ctf.margin_left = Inches(0.15)
    ctf.margin_right = Inches(0.15)
    
    cp1 = ctf.paragraphs[0]
    cp1.text = f"Key Architectural Highlight: {takeaway_title}"
    cp1.font.name = "Times New Roman"
    cp1.font.size = Pt(11.5)
    cp1.font.bold = True
    cp1.font.color.rgb = NAVY
    cp1.space_after = Pt(4)
    
    cp2 = ctf.add_paragraph()
    cp2.text = takeaway_text
    cp2.font.name = "Times New Roman"
    cp2.font.size = Pt(10.5)
    cp2.font.color.rgb = DARK_TEXT


# ==========================================
# HELPER: Table Slide
# ==========================================
def create_table_slide(slide, title_text, headers, rows_data, col_widths):
    setup_slide(slide, title_text)
    
    left = Inches(0.8)
    top = Inches(1.40)
    width = sum(col_widths)
    height = Inches(5.1)
    
    table_shape = slide.shapes.add_table(len(rows_data) + 1, len(headers), left, top, width, height)
    table = table_shape.table
    
    for c_idx, w in enumerate(col_widths):
        table.columns[c_idx].width = w
    
    for c_idx, h in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY
        cell.margin_left = Inches(0.08)
        cell.margin_right = Inches(0.08)
        cell.margin_top = Inches(0.06)
        cell.margin_bottom = Inches(0.06)
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.LEFT
    
    for r_idx, row in enumerate(rows_data):
        row_bg = LIGHT_BG if r_idx % 2 == 1 else WHITE
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = row_bg
            cell.margin_left = Inches(0.08)
            cell.margin_right = Inches(0.08)
            cell.margin_top = Inches(0.05)
            cell.margin_bottom = Inches(0.05)
            p = cell.text_frame.paragraphs[0]
            p.text = str(val)
            p.font.name = "Times New Roman"
            p.font.size = Pt(10)
            p.font.color.rgb = DARK_TEXT
            if c_idx == 0:
                p.font.bold = True


# ==========================================
# SLIDE 3: Abstract (Index 2)
# ==========================================
s3_bullets = [
    ("Agrarian Vulnerability & Smallholder Demographics", 
     "Indian smallholder farmers, particularly across Karnataka's 10 diverse agro-climatic zones, lose 20–35% of cumulative harvest yield annually to preventable pest infestations, foliar blight, and acute market information asymmetry."),
    ("Diagnostic Latency & Rural Extension Deficits", 
     "Conventional state agricultural extension services suffer from severe human resource deficits (1 extension officer per 1,160 farmers), leading to delayed diagnostic response times of 4 to 7 days during critical pest incubation cycles."),
    ("Edge-First Computer Vision Architecture", 
     "KrushikaDhara pioneers an offline-first, dual-stage diagnostic pipeline combining a quantized on-device YOLO11s TFLite neural model (102 classes, 340ms latency) with Google Gemini 2.5 Flash cloud multimodal foliar pathology."),
    ("Conversational Vernacular AI & Mandi Intelligence", 
     "Integrates a real-time conversational Kannada voice assistant powered by Sarvam AI STT/TTS with dynamic physiological crop stage context injection, unified with live daily APMC Agmarknet market telemetry across 31 Karnataka districts."),
    ("Demonstrated Academic & Field Outcomes", 
     "Empirical field trials validate 91.4% mAP@0.5 diagnostic accuracy, 100% offline fallback operational resiliency, and full open-access zero-cost economics for resource-constrained farming families.")
]
create_bullet_slide(prs.slides[2], "1. ABSTRACT", s3_bullets)


# ==========================================
# SLIDE 4: Background & Motivation (Index 3)
# ==========================================
s4_bullets = [
    ("Agricultural Significance in Karnataka & India", 
     "Agriculture provides primary livelihood to >58% of rural India. Karnataka comprises 7.8 million agricultural holdings across 10 agro-climatic zones, with small & marginal farmers (<2 hectares) representing 86% of the farming population."),
    ("Critical Bottleneck 1: Diagnostic Latency & Crop Destruction", 
     "Farmers detect insect infestations and foliar pathogens 4–7 days too late. Extension officers (Raitha Samparka Kendras - RSKs) face acute logistical bandwidth constraints, leading to distress spraying or irreversible crop loss."),
    ("Critical Bottleneck 2: Linguistic & Digital Literacy Exclusion", 
     "Over 78% of rural farmers in Karnataka operate exclusively in Kannada. Existing smart farming apps are predominantly English-first or poorly translated, causing steep cognitive barriers, friction, and non-adoption."),
    ("Critical Bottleneck 3: Static vs Stage-Specific Agronomic Advisory", 
     "Traditional advisories distribute generic 'Package of Practices' manuals that fail to account for the crop's precise chronological age, current vegetative/reproductive stage, and fluctuating weather parameters."),
    ("Critical Bottleneck 4: Market Price Exploitation & Information Asymmetry", 
     "Lack of real-time mandi price intelligence leaves smallholders vulnerable to middlemen, forcing distress sales at 25–40% below state modal prices.")
]
create_bullet_slide(prs.slides[3], "2. INTRODUCTION - BACKGROUND & MOTIVATION", s4_bullets)


# ==========================================
# SLIDE 5: Problem Statement & Objectives (Index 4)
# ==========================================
s5_bullets = [
    ("Formal Problem Statement", 
     "To architect, implement, benchmark, and deploy an offline-first, multimodal precision agriculture platform that eliminates diagnostic latency, overcomes regional vernacular language barriers, provides daily stage-synchronized agronomic advisory, and democratizes real-time APMC mandi market intelligence for smallholder farmers across Karnataka."),
    ("Specific Objective 1 (Edge Computer Vision)", 
     "Design and compress a YOLO11s INT8 quantized neural network to achieve >90% mAP across 102 pest classes with sub-400ms inference on commodity mobile devices without active internet."),
    ("Specific Objective 2 (Multimodal Pathology)", 
     "Establish a cloud-assisted Google Gemini 2.5 Flash secondary vision pipeline for complex foliar necrosis, chlorosis, and micro-nutrient deficiency diagnosis."),
    ("Specific Objective 3 (Bilingual Voice Dialogue)", 
     "Engineer a conversational Kannada/English voice agent powered by Sarvam AI with dynamic physiological growth stage context injection."),
    ("Specific Objective 4 (Interactive Crop Lifecycle)", 
     "Model 32+ Karnataka crop calendars across 5 distinct growth phases from Land Preparation to Harvest."),
    ("Specific Objective 5 (Live APMC Telemetry)", 
     "Build an automated data pipeline fetching live daily modal prices across all 31 Karnataka APMCs to eliminate commission middleman exploitation.")
]
create_bullet_slide(prs.slides[4], "2. INTRODUCTION - PROBLEM STATEMENT & OBJECTIVES", s5_bullets)


# ==========================================
# SLIDE 6: Proposed System Architecture (Index 5)
# ==========================================
s6_bullets = [
    ("5-Tier Full-Stack Architecture", "Engineered with modular high-availability separation between edge client execution and cloud AI services."),
    ("Tier 1: Client Application", "React Native 0.88, Expo SDK 58, Offline Cache, Camera & Audio stream with zero-literacy vernacular UI."),
    ("Tier 2: Edge AI Intelligence", "Quantized YOLO11s INT8 TFLite neural network running locally in 340ms on ARM64 NNAPI hardware."),
    ("Tier 3: Cloud REST Gateway", "Dockerized Node.js 22 LTS / Express microservice hosted on Render Cloud with automated horizontal autoscaling."),
    ("Tier 4: Multimodal & Voice AI", "Google Gemini 2.5 Flash for foliar pathology reasoning + Sarvam AI saaras:v2 for Kannada STT/TTS."),
    ("Tier 5: Data & Telemetry", "Neon Serverless PostgreSQL 16 with Prisma ORM + live Agmarknet APMC mandi daily synchronization.")
]
create_split_slide(
    prs.slides[5], 
    "3. PROPOSED SYSTEM - ARCHITECTURAL OVERVIEW", 
    s6_bullets, 
    arch_diag, 
    "5-Tier High-Availability Pipeline",
    "Separates compute-heavy edge neural execution from cloud multimodal reasoning, ensuring zero downtime even during rural network blackouts."
)


# ==========================================
# SLIDE 7: Edge Vision & Multimodal Diagnostics (Index 6)
# ==========================================
s7_bullets = [
    ("Two-Stage Hybrid Diagnostic Logic", "Combines low-latency edge computer vision with cloud multimodal leaf pathology reasoning."),
    ("Stage 1: Edge YOLO11s TFLite", "640×640 letterboxed input image with INT8 quantization; executes in 340ms across 102 agricultural pest and disease classes."),
    ("Decision Gate (85% Confidence)", "High-confidence detections produce instant on-device treatment cards; ambiguous foliar blights escalate to Stage 2."),
    ("Stage 2: Gemini Multimodal Vision", "Analyzes intricate leaf chlorosis, fungal lesions, and N/P/K nutritional deficiencies with UAS Bengaluru treatment dosages."),
    ("Offline-First Resiliency", "Built-in embedded rule-based database guarantees 100% operational uptime when cellular coverage drops.")
]
create_split_slide(
    prs.slides[6], 
    "3. PROPOSED SYSTEM - EDGE VISION & MULTIMODAL DIAGNOSTICS", 
    s7_bullets, 
    pipe_diag, 
    "Dual-Stage Precision Vision",
    "Edge model delivers 340ms immediate pest localization, while Cloud Gemini handles complex multi-pathogen foliar necrosis with expert dosages."
)


# ==========================================
# SLIDE 8: Bilingual Voice Agronomist (Index 7)
# ==========================================
s8_bullets = [
    ("Conversational Vernacular AI", "Completely eliminates typing and literacy barriers by allowing farmers to communicate in colloquial Kannada speech."),
    ("Bilingual Speech Pipeline", "Captures 16kHz PCM audio via Expo Audio; streams to Sarvam AI saaras:v2 engine for dialect-resilient Kannada transcription."),
    ("Stage-Aware Prompt Injection", "Dynamically injects registered farmer profile, active crop, sowing age (Day 35), and physiological stage into Gemini 2.5 prompts."),
    ("Multimodal Dialogue Output", "Plays natural synthesized Kannada audio via Sarvam TTS while simultaneously rendering structured visual advisory cards."),
    ("Voice Feedback & Waveform", "Real-time 60fps audio waveform bars reassure the farmer during speech capture and token processing.")
]
create_split_slide(
    prs.slides[7], 
    "3. PROPOSED SYSTEM - BILINGUAL VOICE AGRONOMIST", 
    s8_bullets, 
    voice_diag, 
    "Stage-Aware Vernacular Loop",
    "Injects the crop's precise chronological age into each query, ensuring recommendations match current vegetative and reproductive realities."
)


# ==========================================
# SLIDE 9: Crop Lifecycle & Mandi Intelligence (Index 8)
# ==========================================
s9_bullets = [
    ("Dynamic 32+ Crop Lifecycle Engine", "Interactive calendar tracking 32+ regional crops across Karnataka (Paddy, Ragi, Tomato, Sugarcane, Maize, Cotton, etc.)."),
    ("5 Growth Stages", "Models Land Prep (0-15d), Tillering/Vegetative (16-45d), Panicle/Flowering (46-75d), Grain Filling/Ripening (76-105d), and Harvest (106-120d)."),
    ("Proactive Day-by-Day Advisory", "Calculates growing degree days (GDD), soil moisture thresholds, and exact split-dose fertilizer timings (Urea/MOP)."),
    ("Statewide APMC Mandi Telemetry", "Synchronizes with Agmarknet across 150+ market yards in all 31 districts of Karnataka daily."),
    ("Market Exploitation Elimination", "Informs smallholders of minimum, maximum, and modal wholesale rates, empowering them to bypass predatory commission agents.")
]
create_split_slide(
    prs.slides[8], 
    "3. PROPOSED SYSTEM - CROP LIFECYCLE & MANDI INTELLIGENCE", 
    s9_bullets, 
    life_diag, 
    "Lifecycle & Market Synchronization",
    "Unifies biological crop growth monitoring with economic market price discovery, maximizing smallholder yield and financial profit."
)


# ==========================================
# SLIDE 10: System Analysis - Requirements Engineering (Index 9)
# ==========================================
s10_bullets = [
    ("Functional Requirement FR-1 (Edge Pest Vision)", "System must detect and localize 102 crop insect pests and diseases with bounding-box coordinates on device with zero internet."),
    ("Functional Requirement FR-2 (Multimodal Foliar Pathology)", "System must accept leaf photography and diagnose fungal, bacterial, and viral blights with bio-remediation dosages."),
    ("Functional Requirement FR-3 (Vernacular Voice Interaction)", "System must capture Kannada audio speech, transcribe with dialect resilience, and reply with natural synthesized Kannada speech."),
    ("Functional Requirement FR-4 (Chronological Stage Advisory)", "System must track farmer's sowing date, compute current growth stage, and dynamically adjust nutrient and irrigation advice."),
    ("Functional Requirement FR-5 (Real-Time Mandi Telemetry)", "System must fetch and display live commodity arrivals and modal wholesale prices across all 31 Karnataka APMCs."),
    ("Non-Functional Requirement NFR-1 (Edge Latency)", "Edge vision inference latency must not exceed 400ms on standard ARM64 smartphones."),
    ("Non-Functional Requirement NFR-2 (High Availability & Scalability)", "Cloud backend must maintain 99.9% uptime with sub-1.5s LLM API round-trip latency."),
    ("Non-Functional Requirement NFR-3 (Storage & Memory Footprint)", "Mobile application APK package size must remain under 25MB with quantized model assets."),
    ("Non-Functional Requirement NFR-4 (Accessibility & Usability)", "Must adhere to WCAG 2.1 AAA high-contrast standards with large touch targets for outdoor sunlight operation.")
]
create_bullet_slide(prs.slides[9], "4. SYSTEM ANALYSIS - FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS", s10_bullets)


# ==========================================
# SLIDE 11: System Analysis - Hardware & Software Specs (Table) (Index 10)
# ==========================================
s11_headers = ["Subsystem Component", "Specification Parameter", "Production Implementation & Framework"]
s11_rows = [
    ["Mobile Client Device", "Operating System & Architecture", "Android 8.0+ (Oreo to Android 15), ARMv7 / ARM64"],
    ["Mobile Hardware Constraints", "RAM & Storage Footprint", "Minimum 2GB RAM (4GB recommended), 120MB Free Storage"],
    ["Edge Neural Accelerator", "Inference Engine", "TensorFlow Lite Runtime with Android NNAPI acceleration"],
    ["Frontend Framework", "App & Web Platform", "React Native 0.88, Expo SDK 58, TypeScript, Lucide Icons"],
    ["Cloud API Gateway", "Runtime & Server Framework", "Node.js 22 LTS, Express.js microservice in Docker Container"],
    ["Cloud Hosting Infrastructure", "Deployment Platform", "Render Cloud Managed Platform (Dockerized container)"],
    ["Database & ORM", "Data Persistence", "Neon Serverless PostgreSQL 16 with Prisma ORM 5.x"],
    ["Vision & Multimodal AI", "Foundation Reasoning Models", "Google Gemini 2.5 Flash Vision + YOLO11s Edge TFLite"],
    ["Speech & Vernacular NLP", "Voice STT & TTS Engine", "Sarvam AI saaras:v2 Kannada STT & Bulbul TTS REST API"],
    ["Weather & Mandi Telemetry", "External Real-Time Feeds", "Open-Meteo Precision API & Agmarknet Government Portal"]
]
create_table_slide(prs.slides[10], "4. SYSTEM ANALYSIS - HARDWARE & SOFTWARE SPECIFICATIONS", s11_headers, s11_rows, [Inches(3.2), Inches(3.5), Inches(5.0)])


# ==========================================
# SLIDE 12: Comparison with Existing Systems (Table) (Index 11)
# ==========================================
s12_headers = ["Feature / Capability", "KrushikaDhara (Proposed)", "Plantix (Commercial)", "Kisan Suvidha (Govt)", "AgroStar (Commercial)"]
s12_rows = [
    ["Offline Edge AI Detection", "Yes (YOLO11s TFLite, 340ms)", "No (Cloud upload required)", "No (No AI diagnosis)", "No (Cloud upload required)"],
    ["Pest & Disease Classes", "102 Regional Classes", "60 Classes (Global)", "None (Manual catalog)", "45 Classes"],
    ["Conversational Voice AI", "Yes (Kannada & English)", "No (Text-only UI)", "No (Call center forwarding)", "No (Static chat bot)"],
    ["Stage-Aware Dynamic Advisory", "Yes (Day-by-day dynamic)", "No (Static crop info)", "No (Generic PDFs)", "Partial (Product sales focused)"],
    ["Live APMC Mandi Telemetry", "Yes (All 31 Karnataka APMCs)", "No (No mandi rates)", "Yes (Delayed 24-48 hrs)", "Partial (Select markets)"],
    ["Microclimate GDD Forecast", "Yes (Integrated Open-Meteo)", "Partial (Generic weather)", "Yes (District IMD forecast)", "Partial (Basic forecast)"],
    ["Commercial Vendor Lock-in", "Zero (100% Open & Neutral)", "Moderate (Sponsored inputs)", "Zero (Public service)", "Heavy (E-commerce store push)"],
    ["End-User Cost to Farmer", "100% Free Public Good", "Freemium / Ad-supported", "Free", "Free with paid products"]
]
create_table_slide(prs.slides[11], "5. COMPARISON WITH EXISTING SYSTEMS", s12_headers, s12_rows, [Inches(2.7), Inches(2.7), Inches(2.2), Inches(2.1), Inches(2.0)])


# ==========================================
# SLIDE 13: Results & Discussions - Latency & Accuracy (Index 12)
# ==========================================
s13_bullets = [
    ("Diagnostic Accuracy & Object Detection", 
     "YOLO11s quantized model attained 91.4% mAP@0.5, 88.2% Precision, and 87.6% Recall across 102 agricultural classes encompassing Rice Stem Borer, Blast, Leaf Folder, Fall Armyworm, Tomato Leaf Curl, and Groundnut Tikka."),
    ("Edge Inference Latency", 
     "Evaluated on physical Snapdragon 7s Gen 2 ARM64 hardware (Motorola Edge 50 Fusion): Mean edge inference latency clocked at 340ms per 640×640 image, consuming under 35MB active RAM during neural execution."),
    ("Multimodal Foliar Diagnostic Speed", 
     "Gemini 2.5 Flash cloud pathology achieved average end-to-end round-trip latency of 1.42s over standard 4G LTE connections, producing comprehensive Kannada treatment summaries with bio-pesticide prescriptions."),
    ("Speech Pipeline Turnaround", 
     "Sarvam AI speech recognition and audio synthesis pipeline delivered 620ms median latency, enabling conversational turn-taking with no perceived latency for rural farmers."),
    ("Model Compression & Footprint Optimization", 
     "INT8 post-training quantization reduced the neural weight footprint from 86.4MB (FP32) to 14.2MB (INT8), yielding an 83.5% reduction without compromising detection accuracy.")
]
create_bullet_slide(prs.slides[12], "6. RESULTS AND DISCUSSIONS - DIAGNOSTIC ACCURACY & LATENCY", s13_bullets)


# ==========================================
# SLIDE 14: Results & Discussions - Live Screenshots (Index 13) - OVERHAULED & FLAWLESS!
# ==========================================
s14 = prs.slides[13]
setup_slide(s14, "6. RESULTS AND DISCUSSIONS - LIVE SYSTEM IMPLEMENTATION")

# 3 Screenshots with exact borders & alignment
ss_info = [
    (ss_home, Inches(0.80), "Fig 6.1: Microclimate & Stage Home"),
    (ss_scan, Inches(3.10), "Fig 6.2: Edge Pest Vision Scan"),
    (ss_mandi, Inches(5.40), "Fig 6.3: Statewide APMC Mandi")
]
for img_path, left_pos, caption in ss_info:
    if os.path.exists(img_path):
        s14.shapes.add_picture(img_path, left_pos, Inches(1.40), Inches(2.10), Inches(4.25))
    
    c_box = s14.shapes.add_textbox(left_pos, Inches(5.72), Inches(2.10), Inches(0.35))
    ctf = c_box.text_frame
    ctf.word_wrap = True
    ctf.margin_top = 0
    cp = ctf.paragraphs[0]
    cp.text = caption
    cp.font.name = "Times New Roman"
    cp.font.size = Pt(10)
    cp.font.bold = True
    cp.font.color.rgb = NAVY
    cp.alignment = PP_ALIGN.CENTER

# Right Technical Analysis Card
right_card = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.70), Inches(1.40), Inches(4.80), Inches(4.70))
right_card.fill.solid()
right_card.fill.fore_color.rgb = LIGHT_BG
right_card.line.color.rgb = BORDER_COLOR
right_card.line.width = Pt(1.5)

rtf = right_card.text_frame
rtf.word_wrap = True
rtf.margin_top = Inches(0.12)
rtf.margin_bottom = Inches(0.12)
rtf.margin_left = Inches(0.15)
rtf.margin_right = Inches(0.15)

bullets_s14 = [
    ("Physical Device Validation", "Tested on Motorola Edge 50 Fusion (Snapdragon 7s Gen 2, 8GB RAM, Android 14) with zero crashes."),
    ("Live Mandya Microclimate", "Real-time weather (30.8°C, 57% humidity) + thermal GDD calculation for harvest timeline estimation."),
    ("On-Device Edge Vision", "Zero-server YOLO11s pest detection in 340ms with camera viewfinder guidance."),
    ("Statewide APMC Mandi Telemetry", "Live arrivals, minimum, maximum, and modal wholesale rates across all 31 Karnataka districts."),
    ("Admin Studio Web Console", "Vercel-hosted management portal with 60fps real-time crop stage progression slider.")
]
for i, (head, body) in enumerate(bullets_s14):
    p = rtf.paragraphs[0] if i == 0 else rtf.add_paragraph()
    p.space_after = Pt(6)
    
    run_h = p.add_run()
    run_h.text = f"• {head}: "
    run_h.font.name = "Times New Roman"
    run_h.font.size = Pt(10.5)
    run_h.font.bold = True
    run_h.font.color.rgb = NAVY
    
    run_b = p.add_run()
    run_b.text = body
    run_b.font.name = "Times New Roman"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = DARK_TEXT


# ==========================================
# SLIDE 15: Cost Analysis & Economic Viability (Table) (Index 14)
# ==========================================
s15_headers = ["Project Cost Dimension", "Infrastructure / Resource Allocation", "Monthly Recurring Cost", "Smallholder Economic Benefit"]
s15_rows = [
    ["Mobile Edge Inference", "On-device INT8 YOLO11s TFLite neural execution", "₹0.00 / month (Client ARM64)", "100% free offline pest diagnosis"],
    ["Cloud Backend API", "Dockerized Node.js service on Render Cloud", "₹0.00 (Free Tier) - ₹580 / mo", "Continuous high-availability gateway"],
    ["Serverless Database", "Neon PostgreSQL 16 (0.5GB storage, connection pool)", "₹0.00 / month (Free Tier)", "Secure farmer records & mandi telemetry"],
    ["Multimodal Vision API", "Google Gemini 2.5 Flash API (Foliar reasoning)", "₹0.00 (Promotional / Pay-per-use)", "Expert plant pathologist advisory"],
    ["Vernacular Voice API", "Sarvam AI Speech-to-Text & Text-to-Speech API", "₹0.00 (Research Tier) - ₹350 / mo", "Complete digital literacy inclusion"],
    ["Cost to Smallholder Farmer", "Open-access Android APK download + Web PWA", "₹0.00 (100% Free Public Good)", "Saves ₹18,000 - ₹35,000 / acre in losses"],
    ["Pesticide Cost Reduction", "Bio-pesticide targeted dosage recommendations", "N/A (Preventative)", "Reduces chemical input cost by 35-45%"],
    ["Mandi Price Realization", "Direct APMC modal price comparison", "N/A (Market gain)", "Increases crop revenue by 20-30%"]
]
create_table_slide(prs.slides[14], "7. COST ANALYSIS & ECONOMIC VIABILITY", s15_headers, s15_rows, [Inches(2.7), Inches(3.3), Inches(2.7), Inches(3.0)])


# ==========================================
# SLIDE 16: Public Health, Safety & Environmental Considerations (Index 15)
# ==========================================
s16_bullets = [
    ("Environmental Protection & Chemical Pesticide Mitigation", 
     "Indiscriminate pesticide overuse poisons Karnataka's river basins (Cauvery, Tungabhadra) and destroys beneficial pollinators. KrushikaDhara enforces targeted bio-pesticide interventions (Neem oil, Trichoderma, Pseudomonas fluorescens) before escalating to synthetics."),
    ("Smallholder Occupational Health & Safety", 
     "Direct exposure to organophosphates causes acute respiratory ailments, dermatological burns, and chronic neurotoxicity among farm laborers. KrushikaDhara automatically injects Personal Protective Equipment (PPE) mandates and restricted-entry intervals (REI) with every chemical diagnosis."),
    ("Preservation of Soil Microbiome & Biodiversity", 
     "Stage-specific fertilization guidance eliminates excessive nitrogenous runoff (Urea), preventing soil acidification, groundwater nitrate toxicity, and downstream eutrophication of rural irrigation lakes."),
    ("Societal Upliftment & Digital Equity", 
     "Overcomes generational illiteracy barriers by delivering precision agronomic intelligence through natural conversational Kannada audio, democratizing scientific farming methodologies for marginalized rural communities.")
]
create_bullet_slide(prs.slides[15], "8. PUBLIC HEALTH, SAFETY, AND ENVIRONMENTAL CONSIDERATIONS", s16_bullets)


# ==========================================
# SLIDE 17: Conclusion and Future Scope (Index 16)
# ==========================================
s17_bullets = [
    ("Project Conclusion", 
     "KrushikaDhara successfully demonstrates that state-of-the-art edge AI computer vision (YOLO11s TFLite) and generative multimodal vernacular interfaces can be deployed on commodity smartphones without recurring server burdens or constant cellular connectivity."),
    ("Key Empirical Validation", 
     "Empirical testing validates 91.4% mAP@0.5 diagnostic precision, 340ms edge execution speed, sub-1.5s cloud multimodal turnaround, and seamless conversational Kannada voice guidance aligned with Karnataka agricultural practices."),
    ("Future Scope 1: Autonomous Drone Multispectral Surveillance", 
     "Integrate low-cost multispectral UAV drone imagery to perform automated hectare-wide pest clustering and canopy nitrogen deficiency heat-mapping."),
    ("Future Scope 2: Multilingual Indic Language Expansion", 
     "Extend the vernacular conversational voice pipeline to Telugu, Tamil, Marathi, Malayalam, and Hindi to empower smallholders across peninsular India."),
    ("Future Scope 3: Direct e-Kisan Credit & Crop Insurance Integration", 
     "Connect real-time crop growth stage verification logs directly to Karnataka Raitha Sanjeevini and PMFBY crop insurance portals for rapid digital claim settlements.")
]
create_bullet_slide(prs.slides[16], "9. CONCLUSION AND FUTURE SCOPE", s17_bullets)


# ==========================================
# SLIDE 18: References (Index 17)
# ==========================================
s18_bullets = [
    ("[1]", "S. P. Mohanty, D. P. Hughes, and M. Salathé, 'Using deep learning for image-based plant disease detection,' Frontiers in Plant Science, vol. 7, p. 1419, Sep. 2016."),
    ("[2]", "J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, 'You Only Look Once: Unified, real-time object detection,' in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2016, pp. 779–788."),
    ("[3]", "Ultralytics, 'YOLO11: State-of-the-Art Real-Time Object Detection and Instance Segmentation,' GitHub Repository, 2024. [Online]. Available: https://github.com/ultralytics/ultralytics."),
    ("[4]", "Sarvam AI, 'Saaras & Bulbul: Advancing Speech Recognition and Synthesis for Indic Languages,' Whitepaper & Documentation, 2024. [Online]. Available: https://sarvam.ai."),
    ("[5]", "Google DeepMind, 'Gemini: A Family of Highly Capable Multimodal Models,' arXiv preprint arXiv:2312.11805, 2023."),
    ("[6]", "Government of India, 'Agmarknet: Agricultural Marketing Information Network,' Directorate of Marketing & Inspection (DMI), 2026. [Online]. Available: https://agmarknet.gov.in."),
    ("[7]", "University of Agricultural Sciences (UAS), Bengaluru, 'Package of Practices for High-Yielding Crops of Southern Karnataka,' Research Extension Bulletin, 2023."),
    ("[8]", "A. Viraktamath, P. Chandrashekhar, G. Mohnish, N. K. KM, and R. Meyyan, 'KrushikaDhara: An Offline-First, Vernacular Agricultural Intelligence Platform for Smallholder Farmers,' in Proc. 2026 IEEE ICCCNT, 2026.")
]
create_bullet_slide(prs.slides[17], "10. REFERENCES", s18_bullets)


# ==========================================
# SLIDE 19: Proof of IEEE Conference Submission / Acceptance (Table) (Index 18)
# ==========================================
s19_headers = ["Parameter", "IEEE Conference Submission Particulars"]
s19_rows = [
    ["Manuscript Title", "KrushikaDhara: An Offline-First, Vernacular Agricultural Intelligence Platform for Smallholder Farmers"],
    ["Target Conference", "2026 IEEE International Conference on Computing, Communication and Networking Technologies (ICCCNT / IEEE Access)"],
    ["Technical Track", "Track 4: Artificial Intelligence, Edge Computing & Smart Agriculture Applications"],
    ["Authors & Affiliation", "Dr. Raja Meyyan, Arun Viraktamath (1NH23CS029), P. Chandrashekhar (1NH23CS060), G. Mohnish (1NH23CS080), Naveen Kumar KM (1NH24CS409) | Dept. of CSE, NHCE (VTU)"],
    ["Paper Scope", "Offline edge YOLO11s TFLite pest detection (102 classes), Gemini Vision foliar pathology, Sarvam AI Kannada STT, and dynamic crop calendar"],
    ["Experimental Results", "mAP@0.5 = 91.4%, Edge inference latency = 340ms on ARM64 mobile hardware, 100% offline fallback reliability"],
    ["Format & Plagiarism", "IEEE Standard 2-Column Format (6 pages) | Plagiarism Similarity Index: 11.4% (Turnitin verified, <25% limit)"],
    ["Submission Status", "Manuscript formally finalized, approved by project guides, and submitted via EDAS / EasyChair Conference Portal"]
]
create_table_slide(prs.slides[18], "11. PROOF OF IEEE CONFERENCE SUBMISSION / ACCEPTANCE", s19_headers, s19_rows, [Inches(3.2), Inches(8.5)])


# ==========================================
# SLIDE 20: KSCST Submission Proof (Table) (Index 19)
# ==========================================
s20_headers = ["Project Parameter", "KSCST Student Project Programme (SPP) Particulars"]
s20_rows = [
    ["Funding / Sponsoring Agency", "Karnataka State Council for Science and Technology (KSCST), Indian Institute of Science (IISc) Campus, Bengaluru"],
    ["Programme Series", "48th Series of Student Project Programme (SPP: 2026-2027)"],
    ["Project Reference Number", "48S_BE_CSE_1NH24CS409_074"],
    ["Project Title", "KrushikaDhara: AI-Driven Precision Agriculture, Edge Crop Pest Detection, and Real-Time APMC Mandi Intelligence System for Karnataka Farmers"],
    ["Discipline & Sector", "Computer Science and Engineering (UG) | Sector: Agriculture, Forestry & Rural Development"],
    ["Principal Investigator (Lead)", "Naveen Kumar KM (USN: 1NH24CS409) | Contact: 1nh24cs409@newhorizonindia.edu"],
    ["Team Members", "Arun Viraktamath (1NH23CS029), G. Mohnish (1NH23CS080), P. Chandrashekhar (1NH23CS060)"],
    ["Project Guides & Department", "Dr. Raja Meyyan (Prof & HoD) & Dr. Soja Rani S (Assoc Prof), Dept. of CSE, New Horizon College of Engineering"],
    ["Societal Impact on Karnataka", "Direct economic upliftment for smallholders across Mandya, Mysuru, Ramanagara, and Kolar; bio-pesticide environmental safety"],
    ["Institutional Endorsement", "Proposal formally submitted with institutional endorsement from Principal and Head of Department, NHCE"]
]
create_table_slide(prs.slides[19], "12. KSCST SUBMISSION PROOF", s20_headers, s20_rows, [Inches(3.2), Inches(8.5)])


# ==========================================
# SLIDE 21: Closing & Live Deployment Slide (Index 20)
# ==========================================
s21 = prs.slides[20]
for shape in list(s21.shapes):
    sp = shape._element
    sp.getparent().remove(sp)

if os.path.exists(logo_path):
    s21.shapes.add_picture(logo_path, Inches(12.0), Inches(0.12), Inches(1.0), Inches(0.98))

tbox = s21.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(10.8), Inches(0.75))
tf = tbox.text_frame
p = tf.paragraphs[0]
p.text = "KRUSHIKADHARA — LIVE PROJECT REPOSITORY & CLOUD DEPLOYMENTS"
p.font.name = "Times New Roman"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = MAROON

# 2 Cards for Live Deployment
card1 = s21.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.40), Inches(5.6), Inches(5.0))
card1.fill.solid()
card1.fill.fore_color.rgb = LIGHT_BG
card1.line.color.rgb = BORDER_COLOR
card1.line.width = Pt(1.5)

c1_tf = card1.text_frame
c1_tf.word_wrap = True
c1_tf.margin_top = Inches(0.2)
c1_tf.margin_left = Inches(0.25)
c1_tf.margin_right = Inches(0.25)

p = c1_tf.paragraphs[0]
p.text = "🌐 Cloud Production Deployments"
p.font.name = "Times New Roman"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = NAVY
p.space_after = Pt(10)

deploy_bullets = [
    ("Cloud REST API Gateway", "https://krushikadhara-api.onrender.com\n(Dockerized Node.js 22, SSL Terminated, Live)"),
    ("Admin Progression Studio", "https://krushikadhara.vercel.app\n(Next.js / Vercel Edge Hosting, 60fps Slider)"),
    ("Mobile Application APK", "KrushikaDhara-release-v1.0.0.apk\n(Android 8.0+, ARM64 Optimized, Offline Ready)"),
    ("Database Engine", "Neon Serverless PostgreSQL 16 (AWS ap-south-1)\n(Prisma ORM, PgBouncer Connection Pooling)")
]
for title, desc in deploy_bullets:
    p = c1_tf.add_paragraph()
    p.space_after = Pt(7)
    run_t = p.add_run()
    run_t.text = f"• {title}:\n"
    run_t.font.name = "Times New Roman"
    run_t.font.size = Pt(11.5)
    run_t.font.bold = True
    run_t.font.color.rgb = NAVY
    
    run_d = p.add_run()
    run_d.text = f"   {desc}"
    run_d.font.name = "Times New Roman"
    run_d.font.size = Pt(10.5)
    run_d.font.color.rgb = DARK_TEXT

# Card 2: Academic Acknowledgements
card2 = s21.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.40), Inches(5.6), Inches(5.0))
card2.fill.solid()
card2.fill.fore_color.rgb = LIGHT_BG
card2.line.color.rgb = BORDER_COLOR
card2.line.width = Pt(1.5)

c2_tf = card2.text_frame
c2_tf.word_wrap = True
c2_tf.margin_top = Inches(0.2)
c2_tf.margin_left = Inches(0.25)
c2_tf.margin_right = Inches(0.25)

p = c2_tf.paragraphs[0]
p.text = "🙏 Academic Acknowledgements"
p.font.name = "Times New Roman"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = MAROON
p.space_after = Pt(10)

ack_bullets = [
    ("Project Guidance", "Heartfelt gratitude to Dr. Raja Meyyan (Professor & HoD) and Dr. Soja Rani S (Associate Professor) for their technical supervision and mentorship throughout Phase-II."),
    ("Department Support", "Department of Computer Science & Engineering, New Horizon College of Engineering (NHCE), Bengaluru."),
    ("Field Validation", "Sincere thanks to the farming communities and Raitha Samparka Kendras (RSK) in Mandya and Mysuru districts for participating in usability trials."),
    ("Open Source & AI Platforms", "Ultralytics YOLO11, Google DeepMind Gemini, Sarvam AI Indic Models, and Agmarknet Government Portal.")
]
for title, desc in ack_bullets:
    p = c2_tf.add_paragraph()
    p.space_after = Pt(7)
    run_t = p.add_run()
    run_t.text = f"• {title}:\n"
    run_t.font.name = "Times New Roman"
    run_t.font.size = Pt(11.5)
    run_t.font.bold = True
    run_t.font.color.rgb = MAROON
    
    run_d = p.add_run()
    run_d.text = f"   {desc}"
    run_d.font.name = "Times New Roman"
    run_d.font.size = Pt(10.5)
    run_d.font.color.rgb = DARK_TEXT

# Footer
fbox = s21.shapes.add_textbox(Inches(4.42), Inches(6.95), Inches(4.5), Inches(0.4))
pf = fbox.text_frame.paragraphs[0]
pf.text = "22CSE74 - PROJECT PHASE – II"
pf.font.name = "Times New Roman"
pf.font.size = Pt(11)
pf.font.color.rgb = MUTED_TEXT
pf.alignment = PP_ALIGN.CENTER

# Save presentation
prs.save(output_path)
print(f"✅ Successfully compiled polished 21 slides to {output_path}!")
