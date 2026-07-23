import requests
import json
import os
import re

workdir = os.path.dirname(os.path.abspath(__file__))
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# Strategy: Use DuckDuckGo to find direct URLs to free monument GLB files
# Then try to download them

# First, let's try well-known CDN sources that host 3D models
print("=== Trying CDN sources for monument models ===")

# Source: GitHub repos known to host monument models
known_repos = [
    # Try specific known repos with 3D models
    ("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb", "Soldier"),
    ("https://raw.githubusercontent.com/cx20/gltf-test/master/sampleModels/CesiumMan/glTF-Binary/CesiumMan.glb", "CesiumMan"),
    ("https://raw.githubusercontent.com/cx20/gltf-test/master/sampleModels/BrainStem/glTF-Binary/BrainStem.glb", "BrainStem"),
]

downloaded = None

for url, name in known_repos:
    try:
        print(f"Trying {name}: {url}")
        r = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
        if r.status_code == 200:
            size = int(r.headers.get("content-length", 0))
            print(f"  Available! Size: {size} bytes")
            
            if size > 100000:  # Only download if reasonable size
                r2 = requests.get(url, headers=headers, timeout=60)
                if r2.status_code == 200:
                    fname = f"{name}.glb"
                    path = os.path.join(workdir, fname)
                    with open(path, "wb") as f:
                        f.write(r2.content)
                    print(f"  DOWNLOADED: {len(r2.content)} bytes -> {fname}")
                    downloaded = fname
                    break
        else:
            print(f"  Not found: {r.status_code}")
    except Exception as e:
        print(f"  Error: {e}")

if downloaded:
    print(f"\nSuccessfully downloaded: {downloaded}")
else:
    # Try searching for monument models on GitHub using web scraping
    print("\n=== Trying GitHub search via web ===")
    
    # Search GitHub for "monument.glb" files
    search_url = "https://github.com/search?q=monument+extension%3Aglb&type=code"
    try:
        r = requests.get(search_url, headers=headers, timeout=15)
        print(f"GitHub search status: {r.status_code}")
        
        # Extract raw URLs for GLB files
        urls = re.findall(r'href="(/[^"]+/blob/[^"]+\.glb)"', r.text)
        for url in urls[:10]:
            raw_url = url.replace("/blob/", "/raw/")
            full_url = f"https://github.com{raw_url}"
            print(f"  Found: {full_url}")
            
            # Try to download
            try:
                r2 = requests.head(full_url, headers=headers, timeout=10)
                if r2.status_code == 200:
                    size = int(r2.headers.get("content-length", 0))
                    print(f"    Size: {size} bytes")
            except:
                pass
    except Exception as e:
        print(f"  Error: {e}")
    
    # If still nothing, try CDN-based approach
    if not downloaded:
        print("\n=== Trying jsDelivr CDN for npm packages with 3D models ===")
        
        # Try to find npm packages that include monument models via jsDelivr
        npm_search = "https://registry.npmjs.org/-/v1/search?text=monument+3d+glb&size=5"
        try:
            r = requests.get(npm_search, headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                for obj in data.get("objects", [])[:5]:
                    pkg_name = obj["package"]["name"]
                    print(f"  Package: {pkg_name}")
        except Exception as e:
            print(f"  Error: {e}")

print("\n=== Download search complete ===")
