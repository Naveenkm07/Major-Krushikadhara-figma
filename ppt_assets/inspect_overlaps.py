import pptx
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation(r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\Project Phase-II_Review 2_ PPT Template.pptx')

for i, slide in enumerate(prs.slides):
    print(f"\n--- SLIDE {i+1} ---")
    for s_idx, shape in enumerate(slide.shapes):
        shape_type = shape.shape_type
        left = shape.left / 914400.0  # in inches
        top = shape.top / 914400.0
        width = shape.width / 914400.0
        height = shape.height / 914400.0
        
        text_preview = ""
        font_sizes = []
        if shape.has_text_frame:
            for p in shape.text_frame.paragraphs:
                t = p.text.strip()
                if t and not text_preview:
                    text_preview = t[:60]
                for run in p.runs:
                    if run.font.size:
                        font_sizes.append(run.font.size.pt)
        
        fs_str = f"fonts={set(font_sizes)}" if font_sizes else ""
        print(f"  Shape {s_idx} ({shape.name}): left={left:.2f}\", top={top:.2f}\", w={width:.2f}\", h={height:.2f}\" | {fs_str} | '{text_preview}'")

