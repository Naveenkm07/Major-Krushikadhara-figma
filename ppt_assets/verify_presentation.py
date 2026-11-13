import pptx
from pptx import Presentation

pptx_path = r'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\Project Phase-II_Review 2_ PPT Template.pptx'
prs = Presentation(pptx_path)
print(f'Total slides: {len(prs.slides)}')

placeholders = ['Slide Title', 'Slide Content', 'USN- Name-section', 'XYZXYZ', 'Guide 1', 'Guide 2', 'Name of the Project']

clean = True
for idx, slide in enumerate(prs.slides):
    shapes = slide.shapes
    images = [s for s in shapes if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE]
    tables = [s for s in shapes if s.has_table]
    texts = []
    for s in shapes:
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                t = p.text.strip()
                if t:
                    texts.append(t)
    
    full_text = ' '.join(texts)
    found_ph = [ph for ph in placeholders if ph.lower() in full_text.lower()]
    title = texts[0] if texts else 'NO TEXT'
    img_info = f", {len(images)} img(s)" if images else ""
    tbl_info = f", {len(tables)} table(s)" if tables else ""
    print(f"Slide {idx+1:02d}: {title[:45]} | {len(texts)} lines{img_info}{tbl_info}")
    if found_ph:
        print(f"   ⚠️ WARNING: Found placeholders: {found_ph}")
        clean = False

if clean:
    print("\n✅ Verification PASSED: Zero template placeholders found across all 21 slides!")
else:
    print("\n❌ Verification FAILED: Placeholder strings detected.")
