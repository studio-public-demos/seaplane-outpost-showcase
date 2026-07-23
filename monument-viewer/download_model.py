import requests
import json
import os

workdir = os.path.dirname(os.path.abspath(__file__))
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
gh_headers = {**headers, "Accept": "application/vnd.github.v3+json"}

# Try very specific GitHub code searches for monument GLB files
searches = [
    ("statue of liberty", "statue+liberty+extension:glb"),
    ("eiffel tower", "eiffel+tower+extension:glb"),
    ("colosseum", "colosseum+extension:glb"),
    ("taj mahal", "taj+mahal+extension:glb"),
    ("pyramid", "pyramid+extension:glb+filename:egypt"),
    ("sphinx", "sphinx+extension:glb"),
    ("arc de triomphe", "arc+triomphe+extension:glb"),
    ("big ben", "big+ben+extension:glb"),
    ("stonehenge", "stonehenge+extension:glb"),
]

for name, query in searches:
    try:
        r = requests.get(
            "https://api.github.com/search/code",
            params={"q": query, "per_page": 3},
            headers=gh_headers,
            timeout=15
        )
        if r.status_code == 200:
            data = r.json()
            count = data.get("total_count", 0)
            if count > 0:
                print(f"[{name}] Found {count} results:")
                for item in data.get("items", [])[:3]:
                    repo = item["repository"]["full_name"]
                    path = item["path"]
                    # Try both main and master branches
                    raw_url = f"https://raw.githubusercontent.com/{repo}/HEAD/{path}"
                    print(f"  {repo}/{path}")
                    print(f"  Raw: {raw_url}")
            else:
                print(f"[{name}] No results")
        elif r.status_code == 403:
            print(f"[{name}] Rate limited")
            break
        else:
            print(f"[{name}] Status: {r.status_code}")
    except Exception as e:
        print(f"[{name}] Error: {e}")

print("\n=== Also trying direct known URLs ===")

# Known public monument model URLs
known_monument_urls = [
    # Try to get models from three.js examples or other public repos
    ("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Sponza/glTF/Sponza.gltf", "Sponza"),
    ("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", "DamagedHelmet"),
]

for url, name in known_monument_urls:
    try:
        print(f"Trying {name}: {url}")
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 1000:
            ext = url.split(".")[-1]
            fname = f"{name}.{ext}"
            path = os.path.join(workdir, fname)
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"  SUCCESS! {len(r.content)} bytes -> {fname}")
        else:
            print(f"  Failed: status={r.status_code}, size={len(r.content)}")
    except Exception as e:
        print(f"  Error: {e}")
