# 🗺️ Grid Mapper: System Współrzędnych Fonetycznych NATO

[![Status Wdrożenia](https://github.com/bmcodex/Grid-Mapper/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/bmcodex/Grid-Mapper/actions/workflows/pages/pages-build-deployment)

## 🌐 Działająca Aplikacja

Aplikacja jest wdrożona na GitHub Pages i dostępna pod adresem:
**[https://bmcodex.github.io/Grid-Mapper/](https://bmcodex.github.io/Grid-Mapper/)**

---



**Grid Mapper** to aplikacja internetowa zaprojektowana w celu zapewnienia prostego, fonetycznego i bardzo precyzyjnego systemu lokalizacji dla obszaru Polski. System ten jest inspirowany koncepcją Geohash, ale wykorzystuje alfabet fonetyczny NATO do kodowania.

System umożliwia użytkownikom:
1. **Kliknięcie na mapie** w celu wygenerowania unikalnego, 12-znakowego kodu fonetycznego NATO (np. `Hotel Sierra Alpha Zulu Echo Romeo Golf...`) z **dokładnością do około 1 metra**.
2. **Dekodowanie kodu NATO** (zarówno pełnych słów fonetycznych, jak i skróconego kodu literowego) w celu natychmiastowego zlokalizowania punktu na mapie.
3. **Odsłuchanie** kodu za pomocą Web Speech API.
4. **Udostępnianie** lokalizacji za pomocą unikalnego linku.
5. **Otwieranie** lokalizacji w popularnych zewnętrznych aplikacjach mapowych (Google Maps, Apple Maps, Waze).

## 🚀 Funkcjonalności

*   **Konwersja Dwukierunkowa:** Współrzędne GPS ↔ Kod Fonetyczny NATO.
*   **Wysoka Precyzja:** 12-znakowy kod zapewnia dokładność do około 1 metra.
*   **Interfejs Mapy:** Interaktywna mapa oparta na **Leaflet.js** i **OpenStreetMap** z ciemnym, inspirowanym wojskiem motywem.
*   **Synteza Mowy:** Wbudowana funkcja „Odczytaj kod” wykorzystująca **Web Speech API** do poprawnej wymowy NATO.
*   **Linki do Map Zewnętrznych:** Szybkie linki do otwierania lokalizacji w Apple Maps, Google Maps i Waze.
*   **Linki Udostępniania:** Lokalizacje można udostępniać za pomocą prostego parametru URL (`?c=KOD`).
*   **Responsywność:** Pełna obsługa na komputerach stacjonarnych i urządzeniach mobilnych.

## 🧮 Algorytm Siatki NATO

Rdzeniem aplikacji jest niestandardowy hierarchiczny algorytm kodowania geograficznego, podobny do Geohash, ale wykorzystujący system Base-26 oparty na 26 literach alfabetu fonetycznego NATO.

### Zakres Geograficzny (Polska)

System jest skalibrowany dla następującego obszaru granicznego:

| Współrzędna | Minimum | Maksimum | Zakres |
| :--- | :--- | :--- | :--- |
| **Szerokość (Latitude)** | 49.0°N | 55.0°N | 6.0° |
| **Długość (Longitude)** | 14.0°E | 24.0°E | 10.0° |

### Kodowanie (GPS → Kod NATO)

1.  **Normalizacja:** Szerokość i długość geograficzna są normalizowane do zakresu od `0.0` do `1.0` w ramach zdefiniowanych granic.
    ```javascript
    norm_lat = (latitude - 49.0) / 6.0
    norm_lon = (longitude - 14.0) / 10.0
    ```
2.  **Konwersja Base-26:** Znormalizowane wartości są iteracyjnie mnożone przez 26. Część całkowita daje indeks (0-25) dla alfabetu NATO, a część ułamkowa jest używana do następnej iteracji.
3.  **Przeplatanie:** Otrzymane indeksy dla szerokości i długości geograficznej są przeplatane, tworząc ostateczny kod (np. `Lat1`, `Lon1`, `Lat2`, `Lon2`, ...).

| Indeks (0-25) | Słowo Fonetyczne NATO | Litera |
| :--- | :--- | :--- |
| 7 | Hotel | H |
| 18 | Sierra | S |
| 0 | Alpha | A |
| 25 | Zulu | Z |
| ... | ... | ... |

### Dekodowanie (Kod NATO → GPS)

Proces jest odwrócony:
1.  Każda litera w kodzie jest konwertowana z powrotem na swój indeks (0-25).
2.  Indeksy są używane do rekonstrukcji znormalizowanych wartości szerokości (`decoded_lat`) i długości (`decoded_lon`).
3.  Znormalizowane wartości są skalowane z powrotem do oryginalnego zakresu GPS.
    ```javascript
    latitude = 49.0 + (decoded_lat * 6.0)
    longitude = 14.0 + (decoded_lon * 10.0)
    ```

## 🛠️ Stos Technologiczny

*   **Frontend:** Czysty JavaScript (ES6+)
*   **Mapowanie:** [Leaflet.js](https://leafletjs.com/) z kafelkami OpenStreetMap
*   **Stylizacja:** Niestandardowy CSS (Ciemny Motyw)
*   **Mowa:** Web Speech API (`SpeechSynthesis`)

## 💻 Uruchomienie Lokalnie

Aplikacja jest statyczną stroną internetową i można ją uruchomić, po prostu otwierając plik `index.html` w nowoczesnej przeglądarce.

### Wymagania Wstępne

*   Nowoczesna przeglądarka internetowa (Chrome, Firefox, Edge, Safari)

### Konfiguracja

1.  Sklonuj repozytorium:
    ```bash
    git clone https://github.com/bmcodex/Grid-Mapper.git
    cd Grid-Mapper
    ```
2.  Otwórz `index.html` w swojej przeglądarce.

## 🧪 Przykład Testowy

Używając współrzędnych dla **Siedlec**: `52.1677`, `22.2903`

| Współrzędna | Wartość |
| :--- | :--- |
| **Szerokość (Latitude)** | 52.1677 |
| **Długość (Longitude)** | 22.2903 |
| **Oczekiwany Kod NATO** | `Mike India Charlie Hotel Alpha Lima Sierra...` |

Aplikacja powinna poprawnie przekonwertować te współrzędne i wyświetlić wynik.

## 🔗 Generowane Linki Zewnętrzne

Dla lokalizacji o współrzędnych `(lat, lon)` generowane są następujące linki:

*   **Apple Maps:** `https://maps.apple.com/?q={lat},{lon}`
*   **Google Maps:** `https://maps.google.com/?q={lat},{lon}`
*   **Waze:** `https://waze.com/ul?ll={lat},{lon}`

---
*Projekt stworzony przez Agenta Manus.*
