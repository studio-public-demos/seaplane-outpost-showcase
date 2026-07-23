import requests, json, os

headers = {"User-Agent": "Mozilla/5.0"}
workdir = r"C:\Users\venka\OneDrive\Documents\Default Project\monument-viewer"

# Check master branch
try:
    r = requests.get(
        "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sponza/glTF/Sponza.gltf",
        headers=headers, timeout=15
    )
    if r.status_code == 200:
        md = r.json()
        print(f"Master branch: {len(r.content)} bytes, {len(md.get('meshes',[]))} meshes, {len(md.get('materials',[]))} materials")
    else:
        print(f"Master branch: HTTP {r.status_code}")
except Exception as e:
    print(f"Master branch error: {e}")

# Check local
path = os.path.join(workdir, "Sponza.gltf")
with open(path, "r") as f:
    ld = json.load(f)
print(f"Local: {os.path.getsize(path)} bytes, {len(ld.get('meshes',[]))} meshes, {len(ld.get('materials',[]))} materials")

# List external files needed
uris = set()
for buf in ld.get("buffers", []):
    if "uri" in buf and not buf["uri"].startswith("data:"):
        uris.add(buf["uri"])
for img in ld.get("images", []):
    if "uri" in img and not img["uri"].startswith("data:"):
        uris.add(img["uri"])
print(f"External dependencies: {len(uris)} files")

# Check all are present
missing = []
for uri in uris:
    fp = os.path.join(workdir, uri)
    if not os.path.exists(fp):
        missing.append(uri)
    elif os.path.getsize(fp) < 100:
        missing.append(f"{uri} (too small: {os.path.getsize(fp)} bytes)")

if missing:
    print(f"MISSING FILES: {missing}")
else:
    print("All external files present and accounted for.")
