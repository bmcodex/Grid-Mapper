/**
 * Grid Mapper Application
 * Main application logic for map interaction and UI
 */

// Global variables
let map;
let currentMarker;
let currentCoordinates = null;
let currentNatoCode = null;

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
    
    // Add OpenStreetMap tiles with dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Add click event listener to map
    map.on('click', onMapClick);
    
    // Set max bounds to Poland area
    const bounds = L.latLngBounds(
        L.latLng(BOUNDS.minLat, BOUNDS.minLon),
        L.latLng(BOUNDS.maxLat, BOUNDS.maxLon)
    );
    map.setMaxBounds(bounds);
}

/**
 * Initialize event listeners for UI elements
 */
function initEventListeners() {
    // Decode button
    document.getElementById('decodeBtn').addEventListener('click', decodeNatoCode);
    
    // Enter key in input field
    document.getElementById('natoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            decodeNatoCode();
        }
    });
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyCode);
    
    // Speak button
    document.getElementById('speakBtn').addEventListener('click', speakCode);
    
    // External map buttons
    document.getElementById('appleMapsBtn').addEventListener('click', openAppleMaps);
    document.getElementById('googleMapsBtn').addEventListener('click', openGoogleMaps);
    document.getElementById('wazeBtn').addEventListener('click', openWaze);
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareLocation);
}

/**
 * Handle map click event
 */
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
    msg.rate = 0.85;
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
