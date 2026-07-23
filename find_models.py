import urllib.request
import json
import re

print("=" * 60)
print("SEARCHING FOR FREE 3D BARBIE/FASHION DOLL MODELS")
print("=" * 60)

# Source 1: Sketchfab (already confirmed - check if any are CC-BY without NC)
url = 'https://api.sketchfab.com/v3/search?q=barbie+doll&type=models&downloadable=true&count=10'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read())
    print("\n=== SKETCHFAB BARBIE MODELS ===")
    for r in data.get('results', []):
        license_info = r.get('license', {})
        license_label = license_info.get('label', '?')
        is_cc = 'CC' in license_label
        has_nc = 'NonCommercial' in license_label or 'NC' in license_label
        url_3d = f"https://sketchfab.com/3d-models/{r.get('slug','?')}-{r['uid']}"
        print(f"  [{r['name'][:50]}]")
        print(f"    License: {license_label} | Downloadable: {r.get('isDownloadable')}")
        print(f"    Likes: {r.get('likeCount',0)} | Downloads: {r.get('downloadCount',0)}")
        print(f"    URL: {url_3d}")
        print()
except Exception as e:
    print(f"  Error: {e}")

# Source 2: Try searching for stylized/fashion doll free models
print("\n=== OTHER FASHION DOLL MODELS (CC-BY or CC0) ===")
url2 = 'https://api.sketchfab.com/v3/search?q=fashion+doll+woman+character+rigged&type=models&downloadable=true&count=10&sort_by=-likeCount'
req2 = urllib.request.Request(url2, headers={'Accept': 'application/json'})
try:
    resp2 = urllib.request.urlopen(req2, timeout=15)
    data2 = json.loads(resp2.read())
    for r in data2.get('results', []):
        license_label = r.get('license', {}).get('label', '?')
        if 'CC' in license_label:
            url_3d = f"https://sketchfab.com/3d-models/{r.get('slug','?')}-{r['uid']}"
            print(f"  [{r['name'][:50]}] License: {license_label} Likes: {r.get('likeCount',0)}")
            print(f"    {url_3d}")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 60)
print("TO DOWNLOAD FROM SKETCHFAB (free account required):")
print("1. Create free account at sketchfab.com")
print("2. Go to model page URL")
print("3. Click 'Download 3D Model' button")
print("4. Choose 'glTF Binary (.glb)' format")
print("5. Save the file and provide the path")
print("=" * 60)
