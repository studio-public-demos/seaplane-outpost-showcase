import urllib.request
import json

url = 'https://api.sketchfab.com/v3/search?q=doll+female+fashion&type=models&downloadable=true&count=10'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read())
    for r in data.get('results', [])[:15]:
        print(f"{r['name']} | dls:{r.get('downloadCount',0)} | {r.get('viewerUrl','')}")
except Exception as e:
    print(f'Error: {e}')
