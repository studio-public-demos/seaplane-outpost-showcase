import urllib.request
import json

# Search broader for free 3D character models
searches = [
    'fashion+doll+woman+rigged+free',
    'cartoon+girl+dress+free',
    'female+character+dress+free+glb',
    'woman+character+party+dress',
]

for query in searches:
    url = f'https://api.sketchfab.com/v3/search?q={query}&type=models&downloadable=true&count=5&sort_by=-likeCount'
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        results = data.get('results', [])
        if results:
            print(f'\n--- {query} ---')
            for r in results[:5]:
                license_label = r.get('license', {}).get('label', '?')
                print(f"  {r['name'][:60]} | CC:{'Y' if 'CC' in license_label else 'N'} | Likes:{r.get('likeCount',0)} | uid:{r['uid']}")
    except Exception as e:
        print(f'Search error: {e}')
