# FitLife Hub – erster Prototyp

Ein lokaler React/Vite-Prototyp für eine zentrale Fitness-/Lifestyle-App.

## Enthalten

- Dashboard mit Health-, Ernährungs-, Aktivitäts- und Supplement-Karten
- Trainingsbibliothek
- Trainingseinheiten erstellen, bearbeiten und starten
- Satz-/Übungs-Checkliste während eines Trainings
- Supplement-Tracker für Kreatin, Ashwagandha und eigene Einträge
- Kalender-Ansicht
- Komoot-Aktivitäten als Demo-Daten
- YAZIO-Ernährung als Demo-Daten
- Apple-Health-Werte als Demo-Daten
- Integrationsseite als technische Vorbereitung
- localStorage für Trainings und Supplements
- responsive Desktop-/Tablet-/Mobile-UI

## Start

Benötigt Node.js 18+.

```bash
npm install
npm run dev
```

Danach die von Vite angezeigte lokale Adresse öffnen.

## Echte Integrationen

Der Prototyp verwendet absichtlich Demo-Daten. Für echte Daten braucht es als nächsten Schritt:

1. iOS Companion App mit HealthKit für Apple Health.
2. Apple EventKit für Kalenderdaten in der iOS-App.
3. Backend mit sicherer OAuth-/Token-Verwaltung.
4. Offizielle Komoot-Schnittstelle bzw. verfügbare Partner/API-Zugangsdaten.
5. YAZIO-Schnittstelle bzw. Export/API-Zugangsdaten.
6. Datenbank (z.B. PostgreSQL) und Synchronisationsjobs.

Keine Zugangsdaten in den Frontend-Code eintragen.
