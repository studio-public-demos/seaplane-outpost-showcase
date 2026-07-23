import urllib.request
import json

# Check alternative model sources
# 1. Clara.io
# 2. Try Sketchfab download with different approach

# Let me try to get the model files list endpoint
uid = '6bee3fd2a37f4cee98b5ed7174c81692'  # Silkstone Barbie Rigged

# Try the older v2 API
urls_to_try = [
    f'https://api.sketchfab.com/v2/models/{uid}/download',
    f'https://sketchfab.com/models/{uid}/download',
    f'https://sketchfab.com/i/models/{uid}/download',
]

for url in urls_to_try:
    req = urllib.request.Request(url, headers={
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': f'https://sketchfab.com/3d-models/silkstone-barbie-doll-rigged-{uid}',
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        print(f'\nSUCCESS: {url}')
        print(json.dumps(data, indent=2)[:1000])
        break
    except Exception as e:
        print(f'FAIL: {url} -> {e}')
