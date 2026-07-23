import json
import webbrowser
from pathlib import Path

import folium
import requests
from folium.plugins import MiniMap, Fullscreen

OUTPUT = Path(__file__).parent / "earthquake_map.html"

print("Fetching earthquake data from USGS...")
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
resp = requests.get(url, timeout=30)
resp.raise_for_status()
data = resp.json()

print(f"Found {len(data['features'])} earthquakes in the past week")

coords = [
    f["geometry"]["coordinates"] for f in data["features"] if f["geometry"]
]
lats = [c[1] for c in coords]
lons = [c[0] for c in coords]

center_lat = sum(lats) / len(lats) if lats else 0
center_lon = sum(lons) / len(lons) if lons else 0

m = folium.Map(location=[center_lat, center_lon], zoom_start=2, tiles="CartoDB dark_matter")
Fullscreen().add_to(m)
MiniMap(toggle_display=True).add_to(m)

def depth_color(km):
    if km < 30:
        return "#4caf50"
    elif km < 70:
        return "#ffeb3b"
    elif km < 150:
        return "#ff9800"
    else:
        return "#f44336"

for feat in data["features"]:
    props = feat["properties"]
    geom = feat["geometry"]
    if not geom:
        continue
    lon, lat, depth = geom["coordinates"]
    mag = props.get("mag") or 0
    place = props.get("place", "Unknown")
    time_ms = props.get("time", 0)
    url_det = props.get("url", "")

    radius = max(3, mag * 4)

    folium.CircleMarker(
        location=[lat, lon],
        radius=radius,
        color=depth_color(depth),
        weight=1.5,
        fill=True,
        fill_color=depth_color(depth),
        fill_opacity=0.7,
        popup=folium.Popup(
            f"<b>{place}</b><br>Magnitude: {mag}<br>Depth: {depth:.1f} km<br>"
            f"<a href='{url_det}' target='_blank'>USGS Details</a>",
            max_width=250,
        ),
        tooltip=f"M{mag:.1f} {place[:40]}",
    ).add_to(m)

legend_html = """
<div style="position:fixed;bottom:30px;left:12px;z-index:9999;background:rgba(30,30,30,0.85);
color:#ddd;padding:10px 14px;border-radius:6px;font-family:system-ui;font-size:12px;">
<b>Depth (km)</b><br>
<span style="color:#4caf50;">&#9679;</span> &lt;30 shallow<br>
<span style="color:#ffeb3b;">&#9679;</span> 30&ndash;70<br>
<span style="color:#ff9800;">&#9679;</span> 70&ndash;150<br>
<span style="color:#f44336;">&#9679;</span> &gt;150 deep<br>
<b style="display:block;margin-top:4px;">Size = Magnitude</b>
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

m.save(str(OUTPUT))
print(f"Map saved to {OUTPUT}")

webbrowser.open(str(OUTPUT))
print("Map opened in browser.")
