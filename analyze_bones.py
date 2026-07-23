import json

with open(r'C:\Users\venka\OneDrive\Documents\Default Project\barbie-dress-up-game\barbie_model\scene.gltf') as f:
    data = json.load(f)

print('=== SKELETON BONES ===')
# Find the skin and its joints
for i, skin in enumerate(data.get('skins', [])):
    joints = skin.get('joints', [])
    print(f'Skin {i}: {len(joints)} joints')
    for j, joint_idx in enumerate(joints[:30]):
        node = data['nodes'][joint_idx]
        name = node.get('name', f'joint_{j}')
        trans = node.get('translation', [0,0,0])
        print(f'  [{j}] node={joint_idx} {name} pos={[round(v,3) for v in trans]}')

print('\n=== CHILD NODES OF ROOT ===')
# Find the main armature node
root = data['nodes'][0]
print(f'Root: {root.get("name")}')
for child_idx in root.get('children', []):
    child = data['nodes'][child_idx]
    print(f'  child {child_idx}: {child.get("name")}')

# Find node 2950 (Barbie_Silkstone_Art_Arm which has skeleton children)
n2950 = data['nodes'][2950]
print(f'\nNode 2950: {n2950.get("name")}')
for child_idx in n2950.get('children', [])[:15]:
    child = data['nodes'][child_idx]
    name = child.get('name', '?')
    trans = child.get('translation', [0,0,0])
    print(f'  child {child_idx}: {name} pos={[round(v,3) for v in trans]}')
