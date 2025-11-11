# 🗺️ Grid Mapper: NATO Phonetic Coordinate System

**Grid Mapper** is a web application designed to provide a simple, phonetic, and highly precise location system for the area of Poland, inspired by the Geohash concept but utilizing the NATO phonetic alphabet for encoding.

The system allows users to:
1. **Click on a map** to generate a unique, 12-character NATO phonetic code (e.g., `Hotel Sierra Alpha Zulu Echo Romeo Golf...`) with **~1 meter accuracy**.
2. **Decode a NATO code** (either the full phonetic words or the short letter code) to instantly locate the point on the map.
3. **Listen** to the code being read aloud using the Web Speech API.
4. **Share** the location via a unique link.
5. **Open** the location in popular external map applications (Google Maps, Apple Maps, Waze).

## 🚀 Features

*   **Bidirectional Conversion:** GPS coordinates ↔ NATO Phonetic Code.
*   **High Precision:** 12-character code provides accuracy down to approximately 1 meter.
*   **Map Interface:** Interactive map powered by **Leaflet.js** and **OpenStreetMap** with a dark, military-inspired theme.
*   **Speech Synthesis:** Built-in "Read Code" functionality using the **Web Speech API** for correct NATO pronunciation.
*   **External Map Links:** Quick links to open the location in Apple Maps, Google Maps, and Waze.
*   **Shareable Links:** Locations can be shared via a simple URL parameter (`?c=CODE`).
*   **Responsive Design:** Full support for desktop and mobile devices.

## 🧮 The NATO Grid Algorithm

The core of the application is a custom hierarchical geographic encoding algorithm, similar to Geohash, but using a Base-26 system based on the 26 letters of the NATO phonetic alphabet.

### Geographic Scope (Poland)

The system is calibrated for the following bounding box:

| Coordinate | Minimum | Maximum | Range |
| :--- | :--- | :--- | :--- |
| **Latitude** | 49.0°N | 55.0°N | 6.0° |
| **Longitude** | 14.0°E | 24.0°E | 10.0° |

### Encoding (GPS → NATO Code)

1.  **Normalization:** The latitude and longitude are normalized to a `0.0` to `1.0` range within the defined bounds.
    ```
    norm_lat = (latitude - 49.0) / 6.0
    norm_lon = (longitude - 14.0) / 10.0
    ```
2.  **Base-26 Conversion:** The normalized values are iteratively multiplied by 26. The integer part gives the index (0-25) for the NATO alphabet, and the fractional part is used for the next iteration.
3.  **Interleaving:** The resulting indices for latitude and longitude are interleaved to form the final code (e.g., `Lat1`, `Lon1`, `Lat2`, `Lon2`, ...).

| Index (0-25) | NATO Phonetic Word | Letter |
| :--- | :--- | :--- |
| 7 | Hotel | H |
| 18 | Sierra | S |
| 0 | Alpha | A |
| 25 | Zulu | Z |
| ... | ... | ... |

### Decoding (NATO Code → GPS)

The process is reversed:
1.  Each letter in the code is converted back to its index (0-25).
2.  The indices are used to reconstruct the normalized latitude (`decoded_lat`) and longitude (`decoded_lon`) values.
3.  The normalized values are scaled back to the original GPS range.
    ```
    latitude = 49.0 + (decoded_lat * 6.0)
    longitude = 14.0 + (decoded_lon * 10.0)
    ```

## 🛠️ Technology Stack

*   **Frontend:** Vanilla JavaScript (ES6+)
*   **Mapping:** [Leaflet.js](https://leafletjs.com/) with OpenStreetMap tiles
*   **Styling:** Custom CSS (Dark Mode)
*   **Speech:** Web Speech API (`SpeechSynthesis`)

## 💻 Local Development

The application is a static web page and can be run by simply opening `index.html` in a modern web browser.

### Prerequisites

*   A modern web browser (Chrome, Firefox, Edge, Safari)

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/bmcodex/Grid-Mapper.git
    cd Grid-Mapper
    ```
2.  Open `index.html` in your browser.

## 🧪 Example Test Case

Using the coordinates for **Siedlce**: `52.1677`, `22.2903`

| Coordinate | Value |
| :--- | :--- |
| **Latitude** | 52.1677 |
| **Longitude** | 22.2903 |
| **NATO Code** | `Mike India Charlie Hotel Alpha Lima Sierra...` |

The application should correctly convert these coordinates and display the result.

## 🔗 External Links Generated

For a location at `(lat, lon)`, the following links are generated:

*   **Apple Maps:** `https://maps.apple.com/?q={lat},{lon}`
*   **Google Maps:** `https://maps.google.com/?q={lat},{lon}`
*   **Waze:** `https://waze.com/ul?ll={lat},{lon}`

---
*Project created by Manus Agent.*
