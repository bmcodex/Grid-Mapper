/**
 * Radio Codes Dictionary for Grid Mapper
 * Police/Emergency Communication Codes (GTA RP style)
 */

const RADIO_CODES = [
    // 10-Codes (Police)
    { code: "10-1", meaning: "Słaba recepcja", description: "Sygnał jest słaby" },
    { code: "10-2", meaning: "Dobra recepcja", description: "Sygnał jest dobry" },
    { code: "10-3", meaning: "Przerwij transmisję", description: "Czekaj na wiadomość" },
    { code: "10-4", meaning: "Potwierdzam", description: "Wiadomość odebrana i zrozumiana" },
    { code: "10-5", meaning: "Czekaj", description: "Czekaj na dalsze instrukcje" },
    { code: "10-6", meaning: "Zajęty", description: "Zajęty, nie mogę odpowiedzieć" },
    { code: "10-7", meaning: "Poza służbą", description: "Kończy służbę" },
    { code: "10-8", meaning: "W służbie", description: "Powrót do służby" },
    { code: "10-9", meaning: "Powtórz", description: "Powtórz ostatnią wiadomość" },
    { code: "10-10", meaning: "Walka w toku", description: "Bójka, konflikt" },
    { code: "10-11", meaning: "Dyspozytornia zajęta", description: "Dyspozytornia jest zajęta" },
    { code: "10-12", meaning: "Wizyta", description: "Wizyta w dyspozytorni" },
    { code: "10-13", meaning: "Funkcjonariusz w niebezpieczeństwie", description: "Policjant potrzebuje pomocy" },
    { code: "10-14", meaning: "Prowadnik psów", description: "Jednostka ze psami patrolowymi" },
    { code: "10-15", meaning: "Więzień w pojeździe", description: "Transport więźnia" },
    { code: "10-16", meaning: "Domowa wizyta", description: "Wizyta domowa" },
    { code: "10-17", meaning: "Dokument do podpisu", description: "Dokument czeka na podpis" },
    { code: "10-18", meaning: "Komplety dokumentów", description: "Dokumenty gotowe" },
    { code: "10-19", meaning: "Powrót do dyspozytorni", description: "Powrót do bazy" },
    { code: "10-20", meaning: "Moja lokalizacja", description: "Jaka jest moja pozycja?" },
    { code: "10-21", meaning: "Zadzwoń do mnie", description: "Skontaktuj się przez radio" },
    { code: "10-22", meaning: "Anuluj", description: "Anuluj ostatnią wiadomość" },
    { code: "10-23", meaning: "Przyjęto", description: "Wiadomość przyjęta" },
    { code: "10-24", meaning: "Koniec transmisji", description: "Koniec rozmowy" },
    { code: "10-25", meaning: "Spotkanie", description: "Spotkanie w określonym miejscu" },
    { code: "10-26", meaning: "Licencja wygasła", description: "Licencja wygasła" },
    { code: "10-27", meaning: "Licencja aktualna", description: "Licencja jest ważna" },
    { code: "10-28", meaning: "Rejestracja pojazdu", description: "Sprawdzenie rejestracji" },
    { code: "10-29", meaning: "Tło kryminalne", description: "Sprawdzenie przeszłości" },
    { code: "10-30", meaning: "Obiekt nie istnieje", description: "Adres nie znaleziony" },
    { code: "10-31", meaning: "Kradzież w toku", description: "Kradzież w trakcie dokonywania" },
    { code: "10-32", meaning: "Osoba z bronią", description: "Osoba uzbrojona" },
    { code: "10-33", meaning: "Alarm", description: "Alarm włamaniowy" },
    { code: "10-34", meaning: "Bójka", description: "Walka między osobami" },
    { code: "10-35", meaning: "Duża grupa", description: "Duża grupa osób" },
    { code: "10-36", meaning: "Godzina", description: "Jaka jest godzina?" },
    { code: "10-37", meaning: "Operacja specjalna", description: "Specjalna operacja" },
    { code: "10-38", meaning: "Wypadek", description: "Wypadek drogowy" },
    { code: "10-39", meaning: "Pożar", description: "Pożar w toku" },
    { code: "10-40", meaning: "Zagrożenie", description: "Zagrożenie dla bezpieczeństwa" },
    { code: "10-41", meaning: "Początek zmiany", description: "Początek dyżuru" },
    { code: "10-42", meaning: "Koniec zmiany", description: "Koniec dyżuru" },
    { code: "10-43", meaning: "Informacja", description: "Informacja do przekazania" },
    { code: "10-44", meaning: "Wezwanie do dyspozytorni", description: "Wezwanie do bazy" },
    { code: "10-45", meaning: "Zwłoki", description: "Znaleziono zwłoki" },
    { code: "10-46", meaning: "Asystencja", description: "Potrzebna pomoc" },
    { code: "10-47", meaning: "Przeszkoda", description: "Przeszkoda na drodze" },
    { code: "10-48", meaning: "Tekst do wysłania", description: "Wiadomość tekstowa" },
    { code: "10-49", meaning: "Koniec dyżuru", description: "Koniec służby" },
    { code: "10-50", meaning: "Wypadek", description: "Wypadek z udziałem policji" },
    
    // Dodatkowe kody
    { code: "10-Code", meaning: "System kodów", description: "Standardowy system kodów radiowych" },
    { code: "Code-1", meaning: "Normalny priorytet", description: "Normalne tempo" },
    { code: "Code-2", meaning: "Pilny", description: "Szybko, bez sygnałów" },
    { code: "Code-3", meaning: "Bardzo pilny", description: "Szybko, z sygnałami" },
    { code: "Code-4", meaning: "Wszystko pod kontrolą", description: "Sytuacja opanowana" },
    { code: "Code-5", meaning: "Stakeout", description: "Obserwacja" },
];

/**
 * Wyszukaj kod radiowy
 */
function searchRadioCode(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Szukaj po kodzie lub znaczeniu
    const results = RADIO_CODES.filter(item => 
        item.code.toLowerCase().includes(lowerQuery) || 
        item.meaning.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    return results;
}

/**
 * Pobierz kod radiowy po nazwie
 */
function getRadioCodeByName(name) {
    return RADIO_CODES.find(item => item.code.toLowerCase() === name.toLowerCase());
}
