import math

# NATO phonetic alphabet (A-Z)
NATO_ALPHABET = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
    'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
    'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
    'X-ray', 'Yankee', 'Zulu'
]

# Geographic bounds for Poland
BOUNDS = {
    'minLat': 49.0,
    'maxLat': 55.0,
    'minLon': 14.0,
    'maxLon': 24.0
}

# Code length for ~1m precision
CODE_LENGTH = 12

def gps_to_nato(latitude, longitude):
    """Convert GPS coordinates to NATO phonetic code"""
    
    # Normalize coordinates to 0-1 range
    norm_lat = (latitude - BOUNDS['minLat']) / (BOUNDS['maxLat'] - BOUNDS['minLat'])
    norm_lon = (longitude - BOUNDS['minLon']) / (BOUNDS['maxLon'] - BOUNDS['minLon'])
    
    nato_code = []
    
    # Generate code by interleaving latitude and longitude characters
    current_norm_lat = norm_lat
    current_norm_lon = norm_lon
    
    for i in range(CODE_LENGTH):
        # Add NATO words (interleaved: lat, lon, lat, lon, ...)
        if i % 2 == 0:
            # Latitude step
            current_norm_lat *= 26
            lat_index = min(25, math.floor(current_norm_lat))
            nato_code.append(NATO_ALPHABET[lat_index])
            current_norm_lat -= lat_index
        else:
            # Longitude step
            current_norm_lon *= 26
            lon_index = min(25, math.floor(current_norm_lon))
            nato_code.append(NATO_ALPHABET[lon_index])
            current_norm_lon -= lon_index
            
    return ' '.join(nato_code)

# Test case: Siedlce (52.1677, 22.2903)
lat = 52.1677
lon = 22.2903

expected_start = "November Victor Sierra Oscar X-ray Lima Golf"

try:
    result_code = gps_to_nato(lat, lon)
    
    print(f"Test Coordinates: Latitude={lat}, Longitude={lon}")
    print(f"Generated NATO Code: {result_code}")
    
    if result_code.startswith(expected_start.split()[0]):
        print("\n✅ Test passed: The generated code starts with the expected word.")
    else:
        print(f"\n❌ Test failed: Expected start: {expected_start.split()[0]}, Got: {result_code.split()[0]}")
        
except Exception as e:
    print(f"An error occurred during conversion: {e}")

# Second test case for full code verification (first 7 words)
lat_siedlce = 52.167701
lon_siedlce = 22.290301
expected_full_code_start = "November Victor Sierra Oscar X-ray Lima Golf"

try:
    result_code_full = gps_to_nato(lat_siedlce, lon_siedlce)
    
    print(f"\nTest Coordinates (Full): Latitude={lat_siedlce}, Longitude={lon_siedlce}")
    print(f"Generated NATO Code (Full): {result_code_full}")
    
    if result_code_full.startswith(expected_full_code_start):
        print("\n✅ Test passed: The generated code matches the expected start.")
    else:
        print(f"\n❌ Test failed: Expected start: {expected_full_code_start}, Got: {' '.join(result_code_full.split()[:7])}")
        
except Exception as e:
    print(f"An error occurred during conversion: {e}")
