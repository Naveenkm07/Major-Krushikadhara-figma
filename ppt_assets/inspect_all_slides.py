from pptx import Presentation

prs = Presentation(r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\Project Phase-II_Review 2_ PPT Template.pptx')

for i, slide in enumerate(prs.slides):
    print(f"\n--- SLIDE {i+1} ---")
    for s in slide.shapes:
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    sz = r.font.size.pt if r.font.size else "DEF"
                    fn = r.font.name if r.font.name else "DEF"
                    # print first 30 chars
            lines = [p.text.strip() for p in s.text_frame.paragraphs if p.text.strip()]
            bottom = (s.top + s.height) / 914400.0
            print(f"  TextBox '{s.name}': top={s.top/914400:.2f}\", bottom={bottom:.2f}\", lines={len(lines)}, first='{lines[0][:40] if lines else ''}'")
        elif s.has_table:
            bottom = (s.top + s.height) / 914400.0
            print(f"  Table: top={s.top/914400:.2f}\", bottom={bottom:.2f}\", rows={len(s.table.rows)}")
        elif s.shape_type == 13: # picture
            bottom = (s.top + s.height) / 914400.0
            print(f"  Picture: left={s.left/914400:.2f}\", top={s.top/914400:.2f}\", w={s.width/914400:.2f}\", h={s.height/914400:.2f}\", bottom={bottom:.2f}\"")

