const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function latLonToMeters(lat, lon, refLat) {
  const R = 6371000;
  const x = (lon - 0) * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
  const z = (lat - 0) * R * Math.PI / 180;
  return [x, z];
}

function metersToScene(mx, mz, scale) {
  return [mx / scale * 100, mz / scale * 100];
}

export async function loadOSMData(lat, lon, radiusMeters) {
  const query = `
    [out:json][timeout:30];
    (
      way["highway"](around:${radiusMeters},${lat},${lon});
      way["building"](around:${radiusMeters},${lat},${lon});
      node["natural"="tree"](around:${radiusMeters},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!resp.ok) throw new Error(`Overpass API returned ${resp.status}`);
  const data = await resp.json();
  return parseOSMResponse(data, lat, lon, radiusMeters);
}

function parseOSMResponse(data, refLat, refLon, radius) {
  const nodes = {};
  data.elements.forEach(el => {
    if (el.type === 'node') {
      nodes[el.id] = { lat: el.lat, lon: el.lon };
    }
  });

  const roads = [];
  const buildings = [];
  const trees = [];

  data.elements.forEach(el => {
    if (el.type === 'way') {
      if (el.tags && el.tags.highway) {
        const points = (el.nodes || [])
          .map(nid => nodes[nid])
          .filter(n => n)
          .map(n => {
            const [mx, mz] = latLonToMeters(n.lat, n.lon, refLat);
            return metersToScene(mx, mz, radius);
          });
        if (points.length >= 2) {
          const width = getRoadWidth(el.tags.highway);
          roads.push({ points, width, name: el.tags.name || el.tags.highway });
        }
      }
      if (el.tags && el.tags.building) {
        const coords = (el.nodes || [])
          .map(nid => nodes[nid])
          .filter(n => n)
          .map(n => {
            const [mx, mz] = latLonToMeters(n.lat, n.lon, refLat);
            return metersToScene(mx, mz, radius);
          });
        if (coords.length >= 3) {
          const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
          const cz = coords.reduce((s, c) => s + c[1], 0) / coords.length;
          const h = parseHeight(el.tags.height) || (5 + Math.random() * 15);
          const area = computeArea(coords);
          const w = Math.max(3, Math.sqrt(area));
          const d = Math.max(3, Math.sqrt(area));
          buildings.push({ x: cx, z: cz, w, d, h });
        }
      }
    }
    if (el.type === 'node' && el.tags && el.tags.natural === 'tree') {
      const [mx, mz] = latLonToMeters(el.lat, el.lon, refLat);
      trees.push(metersToScene(mx, mz, radius));
    }
  });

  return { roads, buildings, trees };
}

function getRoadWidth(highway) {
  const widths = {
    motorway: 12, trunk: 12, primary: 10, secondary: 9,
    tertiary: 8, residential: 6, service: 4,
    unclassified: 6, living_street: 5, path: 3
  };
  return widths[highway] || 6;
}

function parseHeight(heightStr) {
  if (!heightStr) return null;
  const m = heightStr.match(/([\d.]+)\s*m/);
  return m ? parseFloat(m[1]) : null;
}

function computeArea(coords) {
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  return Math.abs(area) / 2;
}
