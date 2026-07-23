import json
import os
import struct

workdir = r"C:\Users\venka\OneDrive\Documents\Default Project\monument-viewer"

with open(os.path.join(workdir, "Sponza.gltf"), "r") as f:
    gltf = json.load(f)

# Scene structure
scenes = gltf.get("scenes", [])
nodes = gltf.get("nodes", [])
print("=== Scene Structure ===")
for scene in scenes:
    for node_idx in scene.get("nodes", []):
        node = nodes[node_idx]
        mesh_idx = node.get("mesh")
        scale = node.get("scale", [1, 1, 1])
        trans = node.get("translation", [0, 0, 0])
        print(f"Root node: mesh={mesh_idx}, scale={scale}, translation={trans}")

# Find all position accessors with min/max
accessors = gltf.get("accessors", [])
print("\n=== Position Accessor Bounds (before scaling) ===")
pos_bounds = []
for i, acc in enumerate(accessors):
    mn = acc.get("min")
    mx = acc.get("max")
    if mn and mx and len(mn) == 3:
        pos_bounds.append((mn, mx))

if pos_bounds:
    # Compute global bounds
    all_min = [min(b[0][j] for b in pos_bounds) for j in range(3)]
    all_max = [max(b[1][j] for b in pos_bounds) for j in range(3)]
    print(f"Overall bounds (raw): min={all_min}, max={all_max}")
    
    # Apply scale from root node
    root_scale = nodes[0].get("scale", [1, 1, 1])
    scaled_min = [all_min[j] * root_scale[j] for j in range(3)]
    scaled_max = [all_max[j] * root_scale[j] for j in range(3)]
    print(f"After scale {root_scale}: min={[round(v,3) for v in scaled_min]}, max={[round(v,3) for v in scaled_max]}")
    
    center = [(scaled_min[j] + scaled_max[j]) / 2 for j in range(3)]
    size = [scaled_max[j] - scaled_min[j] for j in range(3)]
    print(f"Center: {[round(v,3) for v in center]}")
    print(f"Size: {[round(v,3) for v in size]}")

# Count total components
meshes = gltf.get("meshes", [])
materials = gltf.get("materials", [])
textures = gltf.get("textures", [])
images = gltf.get("images", [])
print(f"\n=== Model Stats ===")
print(f"Meshes: {len(meshes)}")
print(f"Materials: {len(materials)}")
print(f"Textures: {len(textures)}")
print(f"Images: {len(images)}")
print(f"Total primitives: {sum(len(m.get('primitives', [])) for m in meshes)}")

# Check for named nodes
print("\n=== Named Objects ===")
for i, node in enumerate(nodes):
    name = node.get("name", "")
    if name:
        mesh = node.get("mesh")
        children = node.get("children", [])
        print(f"Node {i}: '{name}' mesh={mesh} children={len(children)}")
