import os
import math
import numpy as np
import requests
from PIL import Image
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.colors import LightSource

OUTPUT_PNG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nepal_terrain_map.png")

NORTH, SOUTH, EAST, WEST = 31.0, 26.0, 89.0, 79.5
ZOOM = 7

NORTH_PEAKS = [
    ("Mt. Everest", 8849, 27.9881, 86.9250),
    ("Kangchenjunga", 8586, 27.7025, 88.1467),
    ("Lhotse", 8516, 27.9617, 86.9333),
    ("Makalu", 8485, 27.8897, 87.0886),
    ("Cho Oyu", 8188, 28.0942, 86.6615),
    ("Dhaulagiri", 8167, 28.6967, 83.4875),
    ("Manaslu", 8163, 28.5497, 84.5603),
    ("Annapurna I", 8091, 28.5961, 83.8203),
    ("Ganesh Himal", 7422, 28.3847, 85.0167),
    ("Langtang Lirung", 7227, 28.2133, 85.5228),
]


def latlon_to_tile(lat, lon, zoom):
    n = 2 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def tile_to_latlon(x, y, zoom):
    n = 2 ** zoom
    lon = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    lat = math.degrees(lat_rad)
    return lat, lon


def decode_terrarium(img_array):
    r, g, b = img_array[:, :, 0].astype(np.float64), img_array[:, :, 1].astype(np.float64), img_array[:, :, 2].astype(np.float64)
    return r * 256.0 + g + b / 256.0 - 32768.0


def fetch_terrain_tiles():
    x_min, y_max = latlon_to_tile(NORTH, WEST, ZOOM)
    x_max, y_min = latlon_to_tile(SOUTH, EAST, ZOOM)

    x_min, x_max = min(x_min, x_max), max(x_min, x_max)
    y_min, y_max = min(y_min, y_max), max(y_min, y_max)

    print(f"Fetching tiles: x={x_min}-{x_max}, y={y_min}-{y_max} (zoom={ZOOM})")
    print(f"Total tiles: {(x_max - x_min + 1) * (y_max - y_min + 1)}")

    tile_size = 256
    cols = x_max - x_min + 1
    rows = y_max - y_min + 1
    full_height = rows * tile_size
    full_width = cols * tile_size
    full_array = np.zeros((full_height, full_width, 3), dtype=np.uint8)

    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png"
            try:
                resp = requests.get(url, timeout=15)
                if resp.status_code == 200:
                    img = Image.open(io.BytesIO(resp.content)).convert("RGB")
                    arr = np.array(img)
                    row_idx = y - y_min
                    col_idx = x - x_min
                    full_array[row_idx * tile_size:(row_idx + 1) * tile_size,
                               col_idx * tile_size:(col_idx + 1) * tile_size] = arr
                    print(f"  Tile ({x},{y}) OK")
                else:
                    print(f"  Tile ({x},{y}) HTTP {resp.status_code}")
            except Exception as e:
                print(f"  Tile ({x},{y}) error: {e}")

    elev = decode_terrarium(full_array)

    lat_top = tile_to_latlon(x_min, y_min, ZOOM)[0]
    lat_bot = tile_to_latlon(x_min, y_max + 1, ZOOM)[0]
    lon_left = tile_to_latlon(x_min, y_min, ZOOM)[1]
    lon_right = tile_to_latlon(x_max + 1, y_min, ZOOM)[1]

    extent = [lon_left, lon_right, lat_bot, lat_top]
    print(f"DEM extent: {extent}")
    print(f"DEM shape: {elev.shape}, elevation range: {elev.min():.0f}m - {elev.max():.0f}m")

    return elev, extent


def generate_terrain_map():
    elev, extent = fetch_terrain_tiles()

    elev[elev < -100] = -100
    elev[elev > 9000] = 9000

    ls = LightSource(azdeg=315, altdeg=35)

    terrain_cmap_colors = [
        (0.00, "#0d5c2e"),
        (0.03, "#1a8a4a"),
        (0.08, "#3cb371"),
        (0.14, "#7ccd7c"),
        (0.20, "#b0d460"),
        (0.28, "#e6d84a"),
        (0.36, "#daa520"),
        (0.44, "#cd853f"),
        (0.52, "#b8763e"),
        (0.60, "#a0522d"),
        (0.70, "#8b6e5a"),
        (0.80, "#9e9e9e"),
        (0.88, "#c8c8c8"),
        (0.95, "#e8e8e8"),
        (1.00, "#ffffff"),
    ]
    terrain_cmap = mcolors.LinearSegmentedColormap.from_list("terrain_custom", terrain_cmap_colors)

    vmax = max(elev.max(), 5000)
    norm = mcolors.Normalize(vmin=0, vmax=vmax)
    rgb = terrain_cmap(norm(elev))[:, :, :3]
    hillshade = ls.hillshade(elev, vert_exag=3)
    hillshade3 = np.stack([hillshade] * 3, axis=-1)
    shaded = rgb * 0.7 + rgb * hillshade3 * 0.3
    shaded = np.clip(shaded, 0, 1)

    fig = plt.figure(figsize=(18, 13), facecolor="#0d1117")
    ax = fig.add_axes([0.06, 0.10, 0.80, 0.82], facecolor="#0d1117")
    ax.imshow(shaded, extent=extent, aspect="auto", origin="upper")

    for name, elev_val, lat, lon in NORTH_PEAKS:
        if WEST <= lon <= EAST and SOUTH <= lat <= NORTH:
            ax.plot(lon, lat, "^", color="#ff3333", markersize=9, markeredgecolor="white", markeredgewidth=0.8, zorder=10)
            y_off = 0.18
            if lat > 30.2:
                y_off = -0.3
            ax.annotate(
                f"{name}\n{elev_val:,}m",
                xy=(lon, lat),
                xytext=(0, y_off),
                textcoords="offset points",
                fontsize=6.5,
                fontweight="bold",
                color="white",
                ha="center",
                va="bottom" if y_off > 0 else "top",
                bbox=dict(boxstyle="round,pad=0.25", facecolor="#0d1117", edgecolor="#ff3333", alpha=0.85, linewidth=0.6),
                zorder=11,
            )

    ax.set_xlim(WEST, EAST)
    ax.set_ylim(SOUTH, NORTH)
    ax.set_xlabel("Longitude (E)", color="white", fontsize=12)
    ax.set_ylabel("Latitude (N)", color="white", fontsize=12)
    ax.tick_params(colors="white", labelsize=9)
    ax.grid(True, color="#333333", linewidth=0.3, alpha=0.5)
    for spine in ax.spines.values():
        spine.set_color("#333333")

    cax = fig.add_axes([0.87, 0.10, 0.025, 0.82])
    sm = plt.cm.ScalarMappable(cmap=terrain_cmap, norm=norm)
    sm.set_array([])
    cbar = fig.colorbar(sm, cax=cax)
    cbar.set_label("Elevation (m)", color="white", fontsize=12)
    cbar.ax.tick_params(colors="white", labelsize=9)

    fig.text(
        0.46, 0.95,
        "Nepal & Himalayas Terrain Map",
        ha="center", va="top",
        fontsize=20, fontweight="bold", color="white",
    )
    fig.text(
        0.46, 0.925,
        f"SRTM DEM (AWS Terrain Tiles) | Zoom {ZOOM} | Hillshaded Elevation",
        ha="center", va="top",
        fontsize=10, color="#999999",
    )
    fig.text(
        0.5, 0.03,
        "Data: NASA SRTM via AWS Open Data (elevation-tiles-prod) | Projection: Web Mercator (EPSG:3857)",
        ha="center", fontsize=7, color="#555555",
    )
    fig.text(
        0.99, 0.03,
        "Made with Nebula Cloud Studio",
        ha="right", va="bottom", fontsize=7, color="#555555", alpha=0.6,
    )

    plt.savefig(OUTPUT_PNG, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"\nTerrain map saved to: {OUTPUT_PNG}")


if __name__ == "__main__":
    generate_terrain_map()
