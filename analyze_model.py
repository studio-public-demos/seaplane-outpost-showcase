import json

with open(r'C:\Users\venka\OneDrive\Documents\Default Project\barbie-dress-up-game\barbie_model\scene.gltf') as f:
    data = json.load(f)

print('=== MATERIALS ===')
for i, mat in enumerate(data.get('materials', [])):
    name = mat.get('name', f'material_{i}')
    pbr = mat.get('pbrMetallicRoughness', {})
    bc = pbr.get('baseColorFactor', [1,1,1,1])
    bct = pbr.get('baseColorTexture', {})
    mr = pbr.get('metallicRoughnessTexture', {})
    nm = mat.get('normalTexture', {})
    print(f'  [{i}] {name}')
    print(f'      baseColorFactor: {[round(v,2) for v in bc]}')
    if bct:
        print(f'      baseColorTexture: index={bct.get("index")}')
    if mr:
        print(f'      metallicRoughness: index={mr.get("index")}')
    if nm:
        print(f'      normalTexture: index={nm.get("index")}')

print()
print('=== MESHES ===')
print(f'Total meshes: {len(data.get("meshes", []))}')
for i, mesh in enumerate(data.get('meshes', [])):
    name = mesh.get('name', f'mesh_{i}')
    mats = set()
    for prim in mesh.get('primitives', []):
        mats.add(prim.get('material', '?'))
    print(f'  [{i}] {name} -> material(s): {sorted(mats)}')

print()
print('=== NODES with MESH ===')
for i, node in enumerate(data.get('nodes', [])):
    if 'mesh' in node:
        name = node.get('name', f'node_{i}')
        print(f'  [{i}] {name} -> mesh index: {node["mesh"]}')
