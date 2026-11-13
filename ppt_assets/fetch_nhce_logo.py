import urllib.request
import re
from PIL import Image

url = 'https://newhorizoncollegeofengineering.in'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    matches = re.findall(r'src=["\']([^"\']*(?:logo|crest)[^"\']*\.(?:png|svg|jpg|webp))["\']', html, re.I)
    print('Found logo matches:', matches)
    for m in matches:
        full_url = m if m.startswith('http') else url + '/' + m.lstrip('/')
        print('Trying:', full_url)
        try:
            r2 = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(r2, timeout=5) as res:
                data = res.read()
            ext = full_url.split('.')[-1].split('?')[0]
            out_p = rf'Z:\figma-major-12-11-2026\Major-Krushikadhara-figma\ppt_assets\nhce_site_logo.{ext}'
            with open(out_p, 'wb') as f:
                f.write(data)
            print(f'Saved {out_p}, size={len(data)} bytes')
        except Exception as err:
            print('Failed:', err)
except Exception as e:
    print('Error:', e)
