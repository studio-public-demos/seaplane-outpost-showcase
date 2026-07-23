import urllib.request
import json

# Check specific Barbie models
models = [
    '6bee3fd2a37f4cee98b5ed7174c81692',  # Silkstone Barbie Doll Rigged
    '2067028425134ddd951e0fd51c8da7a8',  # Silkstone Barbie Doll
    'febb6cf953b24537bd5af3bcbd00eba4',  # My Scene Barbie Doll
    'bd913b821b914e4abb6bf082f93bd70a',  # Petal Shine
    'db628eac4b65412a979a6fb3a5719cad',  # Celestial Ice Doll
]

for uid in models:
    url = f'https://api.sketchfab.com/v3/models/{uid}'
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        name = data.get('name', '?')
        license_label = data.get('license', {}).get('label', '?')
        is_downloadable = data.get('isDownloadable', False)
        dl_count = data.get('downloadCount', 0)
        like_count = data.get('likeCount', 0)
        view_count = data.get('viewCount', 0)
        print(f'\n=== {name} ===')
        print(f'  License: {license_label}')
        print(f'  Downloadable: {is_downloadable}')
        print(f'  Downloads: {dl_count}, Likes: {like_count}, Views: {view_count}')
        
        # Check download options
        if is_downloadable:
            dl_url = f'https://api.sketchfab.com/v3/models/{uid}/download'
            dl_req = urllib.request.Request(dl_url, headers={'Accept': 'application/json'})
            try:
                dl_resp = urllib.request.urlopen(dl_req, timeout=10)
                dl_data = json.loads(dl_resp.read())
                print(f'  Download formats: {list(dl_data.get("gltf", {}).keys()) if "gltf" in dl_data else "N/A"}')
                print(f'  All formats: {list(dl_data.keys())}')
            except Exception as e2:
                print(f'  Download info error: {e2}')
    except Exception as e:
        print(f'Error for {uid}: {e}')
