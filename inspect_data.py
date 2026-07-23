import json

with open(r'C:\Users\venka\OneDrive\Documents\Default Project\earthquakes_week.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Features: {len(data['features'])}")
print(f"Type: {data['type']}")
if data['features']:
    props = data['features'][0]['properties']
    print(f"First feature keys: {list(props.keys())[:15]}")
    mags = [f['properties'].get('mag') for f in data['features'] if f['properties'].get('mag')]
    print(f"Magnitude range: {min(mags):.1f} - {max(mags):.1f}")
    print(f"Title: {data['metadata']['title']}")
