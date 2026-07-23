import requests
import json
import os
import time

workdir = os.path.dirname(os.path.abspath(__file__))
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Read the Sponza glTF to find external dependencies
gltf_path = os.path.join(workdir, "Sponza.gltf")
if not os.path.exists(gltf_path):
    print("Sponza.gltf not found, downloading first...")
    url = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Sponza/glTF/Sponza.gltf"
    r = requests.get(url, headers=headers, timeout=30)
    with open(gltf_path, "wb") as f:
        f.write(r.content)
    print(f"Downloaded Sponza.gltf: {len(r.content)} bytes")

with open(gltf_path, "r", encoding="utf-8") as f:
    gltf = json.load(f)

# Collect all external URIs
external_files = set()
for buffer in gltf.get("buffers", []):
    uri = buffer.get("uri", "")
    if uri and not uri.startswith("data:"):
        external_files.add(uri)
for image in gltf.get("images", []):
    uri = image.get("uri", "")
    if uri and not uri.startswith("data:"):
        external_files.add(uri)

print(f"External files needed: {len(external_files)}")
for f in sorted(external_files):
    print(f"  {f}")

base_url = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Sponza/glTF/"

downloaded_count = 0
failed_count = 0

for uri in sorted(external_files):
    url = base_url + uri
    filepath = os.path.join(workdir, uri)
    
    # Skip if already downloaded and size > 0
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        print(f"[SKIP] {uri} (already exists: {os.path.getsize(filepath)} bytes)")
        downloaded_count += 1
        continue
    
    # Create subdirectories if needed
    subdir = os.path.dirname(filepath)
    if subdir:
        os.makedirs(subdir, exist_ok=True)
    
    try:
        print(f"[DOWNLOADING] {uri}...")
        r = requests.get(url, headers=headers, timeout=120, stream=True)
        if r.status_code == 200:
            total_size = int(r.headers.get("content-length", 0))
            with open(filepath, "wb") as f:
                downloaded = 0
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
            file_size = os.path.getsize(filepath)
            print(f"  OK: {file_size} bytes")
            downloaded_count += 1
        else:
            print(f"  FAIL: HTTP {r.status_code}")
            failed_count += 1
    except Exception as e:
        print(f"  ERROR: {e}")
        failed_count += 1

print(f"\nDone! Downloaded: {downloaded_count}, Failed: {failed_count}")
