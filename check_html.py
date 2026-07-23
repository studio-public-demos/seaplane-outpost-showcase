with open(r'C:\Users\venka\OneDrive\Documents\Default Project\barbie-dress-up-game\index.html', 'r') as f:
    content = f.read()

print(f'File size: {len(content)} chars')
print(f'Has DOCTYPE: {"<!DOCTYPE html>" in content}')
print(f'Has closing html: {"</html>" in content}')
print(f'Has closing script: {"</script>" in content}')
print(f'Has GLTFLoader import: {"GLTFLoader" in content}')
print(f'Has scene.gltf: {"barbie_model/scene.gltf" in content}')
print(f'Script tags: {content.count("<script")}')

opens = content.count('{')
closes = content.count('}')
print(f'Braces: open={opens} close={closes} diff={opens - closes}')
opens_p = content.count('(')
closes_p = content.count(')')
print(f'Parens: open={opens_p} close={closes_p} diff={opens_p - closes_p}')

# Check for critical errors
if 'fabricMaterials.length = 0' in content:
    print('WARNING: fabricMaterials array cleared! Check dedup logic.')
