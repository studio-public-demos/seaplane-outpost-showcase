// ============================================
// WebGIS Globe - Tourism Explorer (CesiumJS 3D Globe)
// ============================================

const CONFIG = {
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    OVERPASS_URL: 'https://overpass-api.de/api/interpreter',
    MAX_POIS: 300
};

const POI_COLORS = {
    attraction: '#e74c3c', museum: '#3498db', hotel: '#9b59b6',
    restaurant: '#e67e22', cafe: '#1abc9c', viewpoint: '#f39c12',
    park: '#27ae60', bar: '#8e44ad', hostel: '#2c3e50', shop: '#d35400'
};

const POI_ICONS = {
    attraction: '🏛️', museum: '🏛️', hotel: '🏨', restaurant: '🍽️',
    cafe: '☕', viewpoint: '🌄', park: '🌳', bar: '🍸', hostel: '🛏️', shop: '🛒'
};

const CATEGORY_MAP = {
    'tourism=attraction': { key: 'tourism', value: 'attraction' },
    'tourism=museum': { key: 'tourism', value: 'museum' },
    'tourism=hotel': { key: 'tourism', value: 'hotel' },
    'amenity=restaurant': { key: 'amenity', value: 'restaurant' },
    'amenity=cafe': { key: 'amenity', value: 'cafe' },
    'tourism=viewpoint': { key: 'tourism', value: 'viewpoint' },
    'leisure=park': { key: 'leisure', value: 'park' },
    'amenity=bar': { key: 'amenity', value: 'bar' },
    'tourism=hostel': { key: 'tourism', value: 'hostel' },
    'shop=supermarket': { key: 'shop', value: 'supermarket' }
};

const IMAGERY_LAYERS = {
    osm: { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', credit: 'OpenStreetMap' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', credit: 'Esri' },
    terrain: { url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png', credit: 'OpenTopoMap' },
    dark: { url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', credit: 'CartoDB' }
};

const state = {
    viewer: null,
    entities: [],
    currentLayer: 'osm',
    imageryLayers: {},
    isLoading: false,
    searchTimeout: null
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initGlobe();
    initEventListeners();
});

function initGlobe() {
    Cesium.Ion.defaultAccessToken = '';

    state.viewer = new Cesium.Viewer('cesiumContainer', {
        baseLayer: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        selectionIndicator: true,
        infoBox: false,
        shouldAnimate: true
    });

    setupImageryLayers();

    state.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000)
    });

    state.viewer.scene.globe.enableLighting = false;
    state.viewer.scene.fog.enabled = true;
    state.viewer.scene.skyAtmosphere.show = true;

    state.viewer.scene.frameState.creditDisplay.addStaticCredit(
        new Cesium.Credit('© OpenStreetMap', 'https://openstreetmap.org', false)
    );

    const handler = new Cesium.ScreenSpaceEventHandler(state.viewer.scene.canvas);
    handler.setInputAction((click) => {
        const picked = state.viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id && picked.id.properties) {
            showInfoPanel(picked.id);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    showToast('3D Globe loaded! Search a place or load POIs.', 'success');
}

function setupImageryLayers() {
    state.viewer.imageryLayers.removeAll();

    Object.entries(IMAGERY_LAYERS).forEach(([key, config]) => {
        const provider = new Cesium.UrlTemplateImageryProvider({
            url: config.url,
            maximumLevel: 19,
            credit: new Cesium.Credit(config.credit, false)
        });

        const layer = new Cesium.ImageryLayer(provider);
        layer.show = (key === state.currentLayer);
        state.imageryLayers[key] = layer;
        state.viewer.imageryLayers.add(layer);
    });
}

function switchImageryLayer(layerName) {
    Object.values(state.imageryLayers).forEach(layer => {
        layer.show = false;
    });

    if (state.imageryLayers[layerName]) {
        state.imageryLayers[layerName].show = true;
        state.currentLayer = layerName;
    }

    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.toggle('active', item.dataset.layer === layerName);
    });
}

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    document.getElementById('search-input').addEventListener('input', handleSearchInput);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('clear-search').addEventListener('click', clearSearchInput);

    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    document.querySelectorAll('input[name="basemap"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            switchImageryLayer(e.target.value);
        });
    });

    document.getElementById('load-pois').addEventListener('click', loadPOIs);
    document.getElementById('clear-pois').addEventListener('click', clearPOIs);

    document.getElementById('search-radius').addEventListener('input', (e) => {
        document.getElementById('radius-value').textContent = e.target.value;
    });

    document.getElementById('close-info').addEventListener('click', () => {
        document.getElementById('info-panel').classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
            document.getElementById('search-results').classList.remove('active');
        }
    });
}

// ============================================
// Search
// ============================================

function handleSearchInput(e) {
    const query = e.target.value.trim();
    document.getElementById('clear-search').style.display = query ? 'block' : 'none';

    if (query.length < 2) {
        document.getElementById('search-results').classList.remove('active');
        return;
    }

    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => searchPlaces(query), 500);
}

async function searchPlaces(query) {
    try {
        const response = await fetch(
            `${CONFIG.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`
        );
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed. Please try again.', 'error');
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');

    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">No results found</div>';
        container.classList.add('active');
        return;
    }

    container.innerHTML = results.map((r) => `
        <div class="search-result-item" data-lat="${r.lat}" data-lng="${r.lon}">
            <div class="result-name">${r.display_name.split(',')[0]}</div>
            <div class="result-type">${r.type || 'Place'}</div>
        </div>
    `).join('');

    container.classList.add('active');

    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            const name = item.querySelector('.result-name').textContent;
            flyToLocation(lat, lng, name);
            container.classList.remove('active');
        });
    });
}

function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) searchPlaces(query);
}

function clearSearchInput() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('clear-search').style.display = 'none';
}

// ============================================
// Navigation
// ============================================

function flyToLocation(lat, lng, name) {
    state.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 500000),
        orientation: { heading: 0, pitch: -Math.PI / 3, roll: 0 },
        duration: 2
    });
    showToast(`Flying to ${name}`, 'info');
    setTimeout(() => loadPOIs(), 2500);
}

// ============================================
// POI Loading
// ============================================

async function loadPOIs() {
    if (state.isLoading) return;

    const categories = getSelectedCategories();
    if (categories.length === 0) {
        showToast('Please select at least one POI category', 'error');
        return;
    }

    state.isLoading = true;
    showLoading(true);

    try {
        // Get current camera position for POI search
        const camPos = state.viewer.camera.positionCartographic;
        const centerLat = Cesium.Math.toDegrees(camPos.latitude);
        const centerLon = Cesium.Math.toDegrees(camPos.longitude);
        const radius = parseInt(document.getElementById('search-radius').value);

        console.log(`Loading POIs around: ${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}, radius: ${radius}km`);

        // Build Overpass query using radius-based search
        const query = buildOverpassQueryRadius(categories, centerLat, centerLon, radius);
        console.log('Overpass query:', query);

        const pois = await fetchPOIs(query);

        console.log(`Found ${pois.length} POIs`);

        if (pois.length > 0) {
            displayPOIsOnGlobe(pois);
            showToast(`Loaded ${pois.length} POIs`, 'success');
        } else {
            showToast('No POIs found. Try zooming in closer or changing categories.', 'info');
        }
    } catch (error) {
        console.error('Error loading POIs:', error);
        showToast('Failed to load POIs: ' + error.message, 'error');
    } finally {
        state.isLoading = false;
        showLoading(false);
    }
}

function getSelectedCategories() {
    return Array.from(document.querySelectorAll('#poi-categories input[type="checkbox"]:checked'))
        .map(cb => cb.value);
}

function buildOverpassQueryRadius(categories, lat, lon, radiusKm) {
    const queries = categories.map(cat => {
        const m = CATEGORY_MAP[cat];
        if (!m) return '';
        return `node["${m.key}"="${m.value}"](around:${radiusKm * 1000},${lat},${lon});`;
    }).filter(q => q);

    return `[out:json][timeout:60];(${queries.join('')});out body;`;
}

async function fetchPOIs(query) {
    const response = await fetch(CONFIG.OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Overpass API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return data.elements.filter(el => el.type === 'node' && el.lat && el.lon);
}

function displayPOIsOnGlobe(pois) {
    clearPOIs();
    const poiList = document.getElementById('poi-list');
    poiList.innerHTML = '';
    let count = 0;

    pois.forEach((poi, index) => {
        if (index >= CONFIG.MAX_POIS) return;

        const tags = poi.tags || {};
        const name = tags.name || tags['name:en'] || 'Unnamed';
        const category = detectCategory(tags);
        const color = POI_COLORS[category] || '#fff';
        const icon = POI_ICONS[category] || '📍';

        const entity = state.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat),
            billboard: {
                image: createMarkerImage(color),
                width: 32,
                height: 40,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(500, 1.5, 100000, 0.3)
            },
            label: {
                text: name,
                font: '12px sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -44),
                scaleByDistance: new Cesium.NearFarScalar(500, 1.5, 100000, 0.3),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString('rgba(20,20,40,0.8)')
            },
            properties: {
                name, category, lat: poi.lat, lon: poi.lon, tags,
                address: formatAddress(tags),
                website: tags.website || null,
                phone: tags.phone || null,
                openingHours: tags.opening_hours || null,
                cuisine: tags.cuisine || null,
                rating: tags.stars || null
            }
        });

        state.entities.push(entity);

        const camPos = state.viewer.camera.positionCartographic;
        const lat1 = camPos.latitude * 180 / Math.PI;
        const lon1 = camPos.longitude * 180 / Math.PI;
        const distance = calcDistance(lat1, lon1, poi.lat, poi.lon);

        const item = document.createElement('div');
        item.className = 'poi-item';
        item.innerHTML = `
            <div class="poi-name">${icon} ${name}</div>
            <div class="poi-type">${category}</div>
            <div class="poi-distance">${distance.toFixed(1)} km away</div>
        `;
        item.addEventListener('click', () => {
            flyToPOI(poi.lat, poi.lon);
            showInfoPanel(entity);
        });
        poiList.appendChild(item);
        count++;
    });

    document.getElementById('poi-count').textContent = count;
    updateCategoryCounts(pois);
}

function createMarkerImage(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(16, 38);
    ctx.bezierCurveTo(16, 38, 2, 20, 2, 12);
    ctx.bezierCurveTo(2, 5, 8, 0, 16, 0);
    ctx.bezierCurveTo(24, 0, 30, 5, 30, 12);
    ctx.bezierCurveTo(30, 20, 16, 38, 16, 38);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(16, 14, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    return canvas.toDataURL();
}

function detectCategory(tags) {
    if (tags.tourism === 'attraction') return 'attraction';
    if (tags.tourism === 'museum') return 'museum';
    if (tags.tourism === 'hotel') return 'hotel';
    if (tags.tourism === 'hostel') return 'hostel';
    if (tags.tourism === 'viewpoint') return 'viewpoint';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'bar') return 'bar';
    if (tags.leisure === 'park') return 'park';
    if (tags.shop) return 'shop';
    return 'other';
}

function formatAddress(tags) {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    return parts.join(', ') || 'No address available';
}

function updateCategoryCounts(pois) {
    const counts = {};
    pois.forEach(p => {
        const c = detectCategory(p.tags || {});
        counts[c] = (counts[c] || 0) + 1;
    });
    Object.entries(counts).forEach(([cat, count]) => {
        const el = document.getElementById(`count-${cat}`);
        if (el) el.textContent = count;
    });
}

function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function flyToPOI(lat, lon) {
    state.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000),
        orientation: { heading: 0, pitch: -Math.PI / 4, roll: 0 },
        duration: 1.5
    });
}

function clearPOIs() {
    state.entities.forEach(e => state.viewer.entities.remove(e));
    state.entities = [];
    document.getElementById('poi-list').innerHTML = '';
    document.getElementById('poi-count').textContent = '0';
    document.querySelectorAll('.cat-count').forEach(el => el.textContent = '0');
}

// ============================================
// Info Panel
// ============================================

function showInfoPanel(entity) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');
    const p = entity.properties.getValue(Cesium.JulianDate.now());
    const icon = POI_ICONS[p.category] || '📍';
    const color = POI_COLORS[p.category] || '#fff';

    let html = `<h3>${icon} ${p.name}</h3>
        <div class="info-row"><span class="info-label">Category</span><span class="info-value" style="color:${color}">${p.category}</span></div>
        <div class="info-row"><span class="info-label">Address</span><span class="info-value">${p.address}</span></div>`;

    if (p.openingHours) html += `<div class="info-row"><span class="info-label">Hours</span><span class="info-value">${p.openingHours}</span></div>`;
    if (p.phone) html += `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${p.phone}</span></div>`;
    if (p.website) html += `<div class="info-row"><span class="info-label">Website</span><span class="info-value"><a href="${p.website}" target="_blank" style="color:#3498db;">Visit</a></span></div>`;
    if (p.cuisine) html += `<div class="info-row"><span class="info-label">Cuisine</span><span class="info-value">${p.cuisine}</span></div>`;
    if (p.rating) html += `<div class="info-row"><span class="info-label">Rating</span><span class="info-value">⭐ ${p.rating}/5</span></div>`;

    html += `<div class="info-actions">
        <button class="btn-zoom" onclick="flyToPOI(${p.lat}, ${p.lon})">Zoom Here</button>
        <button class="btn-directions" onclick="openDirections(${p.lat}, ${p.lon})">Directions</button>
    </div>`;

    content.innerHTML = html;
    panel.classList.remove('hidden');
}

function openDirections(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

// ============================================
// Utilities
// ============================================

function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

window.flyToPOI = flyToPOI;
window.openDirections = openDirections;
