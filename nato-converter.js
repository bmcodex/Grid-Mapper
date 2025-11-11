/**
 * NATO Phonetic Alphabet Grid Mapper
 * Converts GPS coordinates to NATO phonetic codes and vice versa
 * Precision: ~1 meter with 12-character codes
 */

// NATO phonetic alphabet (A-Z)
const NATO_ALPHABET = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
    'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
    'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
    'X-ray', 'Yankee', 'Zulu'
];

// Geographic bounds for Poland
const BOUNDS = {
    minLat: 49.0,
    maxLat: 55.0,
    minLon: 14.0,
    maxLon: 24.0
};

// Code length for ~1m precision
const CODE_LENGTH = 12;

/**
 * Convert GPS coordinates to NATO phonetic code
 * @param {number} latitude - Latitude (49.0 to 55.0)
 * @param {number} longitude - Longitude (14.0 to 24.0)
 * @returns {string} NATO phonetic code
 */
function gpsToNato(latitude, longitude) {
    // Validate coordinates
    if (latitude < BOUNDS.minLat || latitude > BOUNDS.maxLat ||
        longitude < BOUNDS.minLon || longitude > BOUNDS.maxLon) {
        throw new Error('Coordinates out of bounds for Poland');
    }
    
    // Normalize coordinates to 0-1 range
    let normLat = (latitude - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);
    let normLon = (longitude - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon);
    
    const natoCode = [];
    
    // Generate code by interleaving latitude and longitude characters
    for (let i = 0; i < CODE_LENGTH; i++) {
        // Multiply by 26 (base-26 system)
        normLat *= 26;
        normLon *= 26;
        
        // Get integer part (index into NATO alphabet)
        const latIndex = Math.floor(normLat);
        const lonIndex = Math.floor(normLon);
        
        // Add NATO words (interleaved: lat, lon, lat, lon, ...)
        if (i % 2 === 0) {
            natoCode.push(NATO_ALPHABET[latIndex]);
            normLat -= latIndex;
        } else {
            natoCode.push(NATO_ALPHABET[lonIndex]);
            normLon -= lonIndex;
        }
    }
    
    return natoCode.join(' ');
}

/**
 * Convert NATO phonetic code to GPS coordinates
 * @param {string} natoCode - NATO phonetic code (words or letters)
 * @returns {object} {latitude, longitude}
 */
function natoToGps(natoCode) {
    // Normalize input: convert to uppercase, remove spaces/dashes
    let normalized = natoCode.toUpperCase().replace(/[\s\-]/g, '');
    
    // Try to parse as NATO words first
    let letters = [];
    
    if (normalized.length <= CODE_LENGTH * 2) {
        // Input is likely single letters (e.g., "HSALERG")
        letters = normalized.split('');
    } else {
        // Input is likely NATO words (e.g., "Hotel Sierra Alpha...")
        const words = natoCode.split(/\s+/);
        letters = words.map(word => {
            const normalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            const index = NATO_ALPHABET.findIndex(nato => 
                nato.toLowerCase() === normalized.toLowerCase()
            );
            if (index === -1) {
                // Try first letter
                return word.charAt(0).toUpperCase();
            }
            return String.fromCharCode(65 + index); // Convert index to letter A-Z
        });
    }
    
    // Ensure we have valid letters
    if (letters.length === 0 || letters.length > CODE_LENGTH) {
        throw new Error('Invalid NATO code format');
    }
    
    let decodedLat = 0;
    let decodedLon = 0;
    
    // Decode interleaved letters
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const charCode = letter.charCodeAt(0);
        
        // Convert letter to index (A=0, B=1, ..., Z=25)
        let index;
        if (charCode >= 65 && charCode <= 90) {
            index = charCode - 65;
        } else {
            throw new Error('Invalid character in NATO code: ' + letter);
        }
        
        // Decode based on position (even = latitude, odd = longitude)
        if (i % 2 === 0) {
            decodedLat = decodedLat + index / Math.pow(26, Math.floor(i / 2) + 1);
        } else {
            decodedLon = decodedLon + index / Math.pow(26, Math.floor(i / 2) + 1);
        }
    }
    
    // Convert back to GPS coordinates
    const latitude = BOUNDS.minLat + (decodedLat * (BOUNDS.maxLat - BOUNDS.minLat));
    const longitude = BOUNDS.minLon + (decodedLon * (BOUNDS.maxLon - BOUNDS.minLon));
    
    return { latitude, longitude };
}

/**
 * Get short code (letters only) from NATO phonetic code
 * @param {string} natoCode - NATO phonetic code
 * @returns {string} Short letter code (e.g., "HSALERG")
 */
function getShortCode(natoCode) {
    return natoCode.split(' ').map(word => word.charAt(0)).join('');
}

/**
 * Validate if coordinates are within Poland bounds
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
function isValidCoordinate(latitude, longitude) {
    return latitude >= BOUNDS.minLat && latitude <= BOUNDS.maxLat &&
           longitude >= BOUNDS.minLon && longitude <= BOUNDS.maxLon;
}
