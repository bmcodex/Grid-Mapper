/**
 * Grid Mapper Application
 * Main application logic for map interaction and UI
 */

// Global variables
let map;
let currentMarker;
let currentCoordinates = null;
let currentNatoCode = null;
let gridVisible = false;
let satelliteLayer = null;
let defaultLayer = null;

// Coordinate parsing patterns
const COORDINATE_PATTERNS = [
    // Format: 52,26755° N, 22,26155° E
    /^\s*([+-]?\d+[.,]\d+)°?\s*([NS])?\s*[,;]?\s*([+-]?\d+[.,]\d+)°?\s*([EW])?\s*$/i,
    // Format: 52.26755, 22.26155 or 52.26755; 22.26155
    /^\s*([+-]?\d+[.,]\d+)\s*[,;]\s*([+-]?\d+[.,]\d+)\s*$/,
    // Format: N 52.26755, E 22.26155
    /^\s*([NS])\s*([+-]?\d+[.,]\d+)\s*[,;]\s*([EW])\s*([+-]?\d+[.,]\d+)\s*$/i
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initEventListeners();
    checkUrlParams();
});

/**
 * Initialize Leaflet map
 */
function initMap() {
    // Create map centered on Poland
    map = L.map('map').setView([52.0, 19.0], 7);
    
    // Add OpenStreetMap tiles with a lighter theme (CartoDB Positron)
    defaultLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Add Satellite layer (Esri World Imagery)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '& copy; Esri, DigitalGlobe, Earthstar Geographics',
        maxZoom: 20
    });
    
    // Add click event listener to map
    map.on('click', onMapClick);
    
    // Set max bounds to Poland area
    const bounds = L.latLngBounds(
        L.latLng(BOUNDS.minLat, BOUNDS.minLon),
        L.latLng(BOUNDS.maxLat, BOUNDS.maxLon)
    );
    map.setMaxBounds(bounds);
    
    // Initialize grid
    initializeGrid();
}

/**
 * Initialize event listeners for UI elements
 */
function initEventListeners() {
    initializeTabs();
    displayAllRadioCodes();
    loadSavedLocations();
    // Decode button
    document.getElementById('decodeBtn').addEventListener('click', decodeNatoCode);
    
    // Paste Coordinates button
    document.getElementById('pasteCoordinatesBtn').addEventListener('click', convertCoordinatesToNato);
    
    // Map controls
    document.getElementById('toggleGridBtn').addEventListener('click', toggleGrid);
    document.getElementById('toggleSatelliteBtn').addEventListener('click', toggleSatellite);
    
    // Radio codes
    document.getElementById('searchRadioCodeBtn').addEventListener('click', searchAndDisplayRadioCode);
    document.getElementById('radioCodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAndDisplayRadioCode();
        }
    });
    
    //    // Enter key in input field
    document.getElementById('natoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            decodeNatoCode();
        }
    });
    
    // Enter key in Coordinates input field
    document.getElementById('coordinatesInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertCoordinatesToNato();
        }
    });
    
    // Copy buttontton
    document.getElementById('copyBtn').addEventListener('click', copyCode);
    
    // Speak button
    document.getElementById('speakBtn').addEventListener('click', speakCode);
    
    // External map buttons
    document.getElementById('appleMapsBtn').addEventListener('click', openAppleMaps);
    document.getElementById('googleMapsBtn').addEventListener('click', openGoogleMaps);
    document.getElementById('wazeBtn').addEventListener('click', openWaze);
    document.getElementById('osmandBtn').addEventListener('click', openOsmAnd);
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareLocation);
}

/**
 * Handle map click event
 */


/**
 * Parse coordinates from various formats
 * Supports: 52,26755° N, 22,26155° E or 52.26755, 22.26155 or 52.26755;22.26155 or N 52.26755, E 22.26155
 */
function parseCoordinates(input) {
    const trimmed = input.trim();
    
    // Try each pattern
    for (let i = 0; i < COORDINATE_PATTERNS.length; i++) {
        const pattern = COORDINATE_PATTERNS[i];
        const match = trimmed.match(pattern);
        if (match) {
            let lat, lon;
            
            // Pattern 0: 52,26755° N, 22,26155° E (with directions)
            if (i === 0 && match.length === 5 && (match[2] || match[4])) {
                lat = parseFloat(match[1].replace(',', '.'));
                lon = parseFloat(match[3].replace(',', '.'));
                
                if (match[2] && (match[2] === 'S' || match[2] === 's')) lat = -lat;
                if (match[4] && (match[4] === 'W' || match[4] === 'w')) lon = -lon;
            }
            // Pattern 1: 52.26755, 22.26155 or 52.26755; 22.26155 (simple format)
            else if (i === 1 && match.length === 3) {
                lat = parseFloat(match[1].replace(',', '.'));
                lon = parseFloat(match[2].replace(',', '.'));
            }
            // Pattern 2: N 52.26755, E 22.26155 (directions first)
            else if (i === 2 && match.length === 5) {
                lat = parseFloat(match[2].replace(',', '.'));
                lon = parseFloat(match[4].replace(',', '.'));
                
                if (match[1] && (match[1] === 'S' || match[1] === 's')) lat = -lat;
                if (match[3] && (match[3] === 'W' || match[3] === 'w')) lon = -lon;
            }
            
            if (!isNaN(lat) && !isNaN(lon)) {
                return { latitude: lat, longitude: lon };
            }
        }
    }
    
    throw new Error('Invalid coordinate format. Use: 52.26755;22.26155 or 52,26755° N, 22,26155° E or 52.26755, 22.26155');
}

/**
 * Convert coordinates from input field to NATO code
 */
function convertCoordinatesToNato() {
    const input = document.getElementById('coordinatesInput').value.trim();
    
    if (!input) {
        showNotification('⚠️ Please enter coordinates', 'warning');
        return;
    }
    
    try {
        // Parse coordinates
        const coords = parseCoordinates(input);
        
        // Validate coordinates
        if (!isValidCoordinate(coords.latitude, coords.longitude)) {
            showNotification('⚠️ Coordinates are outside Poland boundaries', 'warning');
            return;
        }
        
        // Convert to NATO code
        const natoCode = gpsToNato(coords.latitude, coords.longitude);
        
        // Update display
        updateDisplay(coords.latitude, coords.longitude, natoCode);
        
        // Add marker and pan to location
        addMarker(coords.latitude, coords.longitude);
        map.setView([coords.latitude, coords.longitude], 15);
        
        showNotification('✅ Współrzędne skonwertowane!', 'success');
        
    } catch (error) {
        showNotification('❌ Błąd: ' + error.message, 'error');
    }
}

function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    
    // Validate coordinates
    if (!isValidCoordinate(lat, lon)) {
        showNotification('⚠️ Please click within Poland boundaries', 'warning');
        return;
    }
    
    try {
        // Convert to NATO code
        const natoCode = gpsToNato(lat, lon);
        
        // Update display
        updateDisplay(lat, lon, natoCode);
        
        // Add marker to map
        addMarker(lat, lon);
        
    } catch (error) {
        showNotification('❌ Error: ' + error.message, 'error');
    }
}

/**
 * Decode NATO code from input field
 */
function decodeNatoCode() {
    const input = document.getElementById('natoInput').value.trim();
    
    if (!input) {
        showNotification('⚠️ Please enter a NATO code', 'warning');
        return;
    }
    
    try {
        // Convert NATO code to GPS
        const coords = natoToGps(input);
        
        // Validate coordinates
        if (!isValidCoordinate(coords.latitude, coords.longitude)) {
            showNotification('⚠️ Decoded coordinates are outside Poland', 'warning');
            return;
        }
        
        // Convert back to get full NATO code
        const natoCode = gpsToNato(coords.latitude, coords.longitude);
        
        // Update display
        updateDisplay(coords.latitude, coords.longitude, natoCode);
        
        // Add marker and pan to location
        addMarker(coords.latitude, coords.longitude);
        map.setView([coords.latitude, coords.longitude], 15);
        
        showNotification('✅ Location found!', 'success');
        
    } catch (error) {
        showNotification('❌ Invalid NATO code: ' + error.message, 'error');
    }
}

/**
 * Update the display panel with coordinates and NATO code
 */
function loadSavedLocations() {
    const list = document.getElementById('locationsList');
    list.innerHTML = ''; // Clear existing list

    PREDEFINED_LOCATIONS.forEach(location => {
        const listItem = document.createElement('li');
        listItem.className = 'location-item';
        listItem.innerHTML = `
            <span class="location-name">${location.name}</span>
            <span class="location-code">${location.code}</span>
            <button class="btn-small" data-code="${location.code}">Pokaż</button>
        `;
        listItem.querySelector('button').addEventListener('click', function() {
            document.getElementById('natoInput').value = location.code;
            decodeNatoCode();
        });
        list.appendChild(listItem);
    });
}

function updateDisplay(lat, lon, natoCode) {
    currentCoordinates = { lat, lon };
    currentNatoCode = natoCode;
    
    // Update values
    document.getElementById('latValue').textContent = lat.toFixed(6);
    document.getElementById('lonValue').textContent = lon.toFixed(6);
    document.getElementById('natoValue').textContent = natoCode;
    
    // Show result panel
    document.getElementById('resultPanel').classList.remove('hidden');
    
    // Hide share link
    document.getElementById('shareLink').classList.add('hidden');
}

/**
 * Add or update marker on map
 */
function addMarker(lat, lon) {
    // Remove existing marker
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Create custom pulsing icon
    const pulsingIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #4a9eff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 0 rgba(74, 158, 255, 0.7); animation: pulse 2s infinite;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    // Add new marker
    currentMarker = L.marker([lat, lon], { icon: pulsingIcon }).addTo(map);
    
    // Add Satellite layer (Esri World Imagery)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '& copy; Esri, DigitalGlobe, Earthstar Geographics',
        maxZoom: 20
    });
}

/**
 * Copy NATO code to clipboard
 */
function copyCode() {
    if (!currentNatoCode) return;
    
    navigator.clipboard.writeText(currentNatoCode).then(() => {
        showNotification('📋 Code copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('❌ Failed to copy code', 'error');
    });
}

/**
 * Speak NATO code using Web Speech API
 */
function speakCode() {
    if (!currentNatoCode) return;
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        showNotification('❌ Speech synthesis not supported', 'error');
        return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create speech utterance
    const msg = new SpeechSynthesisUtterance(currentNatoCode);
    msg.lang = 'en-US';
    msg.rate = 0.4; // Very slow rate to simulate half-second pauses between words
    msg.pitch = 1.0;
    msg.volume = 1.0;
    
    // Speak
    speechSynthesis.speak(msg);
    
    showNotification('🔊 Reading NATO code...', 'info');
}

/**
 * Open location in Apple Maps
 */
function openAppleMaps() {
    if (!currentCoordinates) return;
    const url = `https://maps.apple.com/?q=${currentCoordinates.lat},${currentCoordinates.lon}`;
    window.open(url, '_blank');
}

/**
 * Open location in Google Maps
 */
function openGoogleMaps() {
    if (!currentCoordinates) return;
    const url = `https://maps.google.com/?q=${currentCoordinates.lat},${currentCoordinates.lon}`;
    window.open(url, '_blank');
}

/**
 * Open location in Waze
 */
function openWaze() {
    if (!currentCoordinates) return;
    const url = `https://waze.com/ul?ll=${currentCoordinates.lat},${currentCoordinates.lon}`;
    window.open(url, '_blank');
}

/**
 * Open location in OsmAnd
 */
function openOsmAnd() {
    if (!currentCoordinates) return;
    const url = `https://osmand.net/go?lat=${currentCoordinates.lat}&lon=${currentCoordinates.lon}&z=15`;
    window.open(url, '_blank');
}

/**
 * Generate and display shareable link
 */
function shareLocation() {
    if (!currentNatoCode) return;
    
    // Get short code (letters only)
    const shortCode = getShortCode(currentNatoCode);
    
    // Generate URL
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?c=${shortCode}`;
    
    // Display link
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.value = shareUrl;
    shareLinkInput.classList.remove('hidden');
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('🔗 Share link copied to clipboard!', 'success');
    });
}

/**
 * Check URL parameters for shared location
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('c');
    
    if (code) {
        // Set input value
        document.getElementById('natoInput').value = code;
        
        // Decode automatically
        setTimeout(() => {
            decodeNatoCode();
        }, 500);
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    // Change color based on type
    if (type === 'success') {
        notification.style.background = '#2a5f3a';
        notification.style.color = '#5dff8f';
    } else if (type === 'error') {
        notification.style.background = '#5f2a2a';
        notification.style.color = '#ff5d5d';
    } else if (type === 'warning') {
        notification.style.background = '#5f4a2a';
        notification.style.color = '#ffb85d';
    } else {
        notification.style.background = '#2a3f5f';
        notification.style.color = '#5d9fff';
    }
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

/**
 * Initialize tabs
 */
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });
}

/**
 * Display all radio codes in list
 */
function displayAllRadioCodes() {
    const codesList = document.getElementById('radioCodesList');
    let html = '';
    
    RADIO_CODES.forEach(code => {
        html += `
            <div class="code-row">
                <div class="code-header">
                    <span class="code-code">${code.code}</span>
                    <span class="code-meaning">${code.meaning}</span>
                </div>
                <div class="code-description">${code.description}</div>
            </div>
        `;
    });
    
    codesList.innerHTML = html;
}

/**
 * Initialize grid visualization
 */
let gridLayer = null;

function initializeGrid() {
    gridLayer = L.featureGroup();
    drawGrid();
}

/**
 * Draw grid on map
 */
function drawGrid() {
    if (gridLayer) {
        gridLayer.clearLayers();
    }
    
    const latStep = (BOUNDS.maxLat - BOUNDS.minLat) / 10;
    const lonStep = (BOUNDS.maxLon - BOUNDS.minLon) / 10;
    
    // Draw horizontal lines
    for (let lat = BOUNDS.minLat; lat <= BOUNDS.maxLat; lat += latStep) {
        const line = L.polyline([
            [lat, BOUNDS.minLon],
            [lat, BOUNDS.maxLon]
        ], {
            color: '#4a9eff',
            weight: 1,
            opacity: 0.5,
            dashArray: '5, 5'
        });
        gridLayer.addLayer(line);
    }
    
    // Draw vertical lines
    for (let lon = BOUNDS.minLon; lon <= BOUNDS.maxLon; lon += lonStep) {
        const line = L.polyline([
            [BOUNDS.minLat, lon],
            [BOUNDS.maxLat, lon]
        ], {
            color: '#4a9eff',
            weight: 1,
            opacity: 0.5,
            dashArray: '5, 5'
        });
        gridLayer.addLayer(line);
    }
}

/**
 * Toggle grid visibility
 */
function toggleGrid() {
    gridVisible = !gridVisible;
    const btn = document.getElementById('toggleGridBtn');
    
    if (gridVisible) {
        map.addLayer(gridLayer);
        btn.classList.add('active');
        showNotification('🔲 Siatka włączona', 'info');
    } else {
        map.removeLayer(gridLayer);
        btn.classList.remove('active');
        showNotification('🔲 Siatka wyłączona', 'info');
    }
}

/**
 * Toggle satellite layer
 */
function toggleSatellite() {
    const btn = document.getElementById('toggleSatelliteBtn');
    
    if (map.hasLayer(defaultLayer)) {
        map.removeLayer(defaultLayer);
        map.addLayer(satelliteLayer);
        btn.classList.add('active');
        showNotification('🛰️ Satelita włączony', 'info');
    } else {
        map.removeLayer(satelliteLayer);
        map.addLayer(defaultLayer);
        btn.classList.remove('active');
        showNotification('🛰️ Satelita wyłączony', 'info');
    }
}

/**
 * Search and display radio code
 */
function searchAndDisplayRadioCode() {
    const input = document.getElementById('radioCodeInput').value.trim();
    
    if (!input) {
        showNotification('⚠️ Wpisz kod lub znaczenie', 'warning');
        return;
    }
    
    const results = searchRadioCode(input);
    const resultDiv = document.getElementById('radioCodeResult');
    
    if (results.length === 0) {
        resultDiv.classList.add('hidden');
        showNotification('❌ Kod nie znaleziony', 'error');
        return;
    }
    
    let html = '';
    results.forEach(code => {
        html += `
            <div class="radio-code-item">
                <div class="radio-code-code">${code.code}</div>
                <div class="radio-code-meaning">${code.meaning}</div>
                <div class="radio-code-description">${code.description}</div>
            </div>
        `;
    });
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');
    showNotification(`✅ Znaleziono ${results.length} kod(ów)`, 'success');
}

/**
 * Initialize tabs
 */
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });
}

/**
 * Display all radio codes in list
 */
function displayAllRadioCodes() {
    const codesList = document.getElementById('radioCodesList');
    let html = '';
    
    RADIO_CODES.forEach(code => {
        html += `
            <div class="code-row">
                <div class="code-header">
                    <span class="code-code">${code.code}</span>
                    <span class="code-meaning">${code.meaning}</span>
                </div>
                <div class="code-description">${code.description}</div>
            </div>
        `;
    });
    
    codesList.innerHTML = html;
}
