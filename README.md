# OktoPOS API Tester

Ein kleines, dockerisiertes Web-Interface zum Testen der **OktoPOS Customer API**.
Du gibst deinen API-Key und die Base-URL deiner OktoPOS-Instanz direkt im Browser ein,
und kannst dann alle Endpunkte mit ein paar Klicks ausprobieren.

![Screenshot Platzhalter](https://placehold.co/800x420?text=OktoPOS+API+Tester)

## Features

- Schöne, dunkle Web-Oberfläche – keine Installation nötig, nur Browser
- Komplette Customer-API abgedeckt:
  - `POST /v1/customers` – Kunden anlegen
  - `GET  /v1/customers/findByExternalIdentifier/{externalIdentifier}`
  - `GET  /v1/customers/findByPhoneNumber`
  - `POST /v1/customers/createVoucherAccount`
  - `GET  /v1/customers/check-balance/{cardNumber}`
  - `POST /v1/customers/recharge-balance`
- API-Key & Base-URL werden lokal im Browser (localStorage) gespeichert
- Eingebauter Proxy in Python/Flask – keine CORS-Probleme
- Verbindung kann über "🔌 Verbindung testen" geprüft werden
- JSON-Syntax-Highlighting, Status, Antwortzeit
- Vorausgefüllte JSON-Beispiele für komplexe Endpunkte

## Schnellstart

### Variante A: docker compose

```bash
docker compose up -d --build
```

Dann im Browser öffnen: <http://localhost:8080>

### Variante B: nur docker

```bash
docker build -t oktopos-api-tester .
docker run --rm -p 8080:8080 --name oktopos-api-tester oktopos-api-tester
```

Wieder: <http://localhost:8080>

## Einstellungen

Beim ersten Start öffnet sich automatisch der Einstellungs-Dialog:

| Feld | Beschreibung |
|------|--------------|
| **Base URL** | URL deiner OktoPOS-Instanz, **ohne** `/v1` am Ende, z.B. `https://manager.deine-firma.tld` |
| **API Key** | Der API-Key aus deinem OktoPOS Manager (siehe `OktoPOS → System`) |
| **Auth-Stil** | `Header` (Standard) oder `Authorization: Bearer …` |
| **Auth-Header** | Header-Name (Default `X-API-Key`) |

Die Daten werden nur im Browser gespeichert (localStorage). Sie verlassen nie deinen Rechner,
außer in den eigentlichen API-Aufrufen, die der Container an deine OktoPOS-Instanz weiterleitet.

Optional kannst du Defaults auch beim Container-Start setzen:

```bash
docker run --rm -p 8080:8080 \
  -e OKTOPOS_BASE_URL="https://manager.deine-firma.tld" \
  -e OKTOPOS_API_KEY="dein-key" \
  oktopos-api-tester
```

## Architektur

```
Browser  ─► Flask /api/proxy ─► OktoPOS Customer API
   ▲              │
   └── HTML/JS ◀──┘
```

Die statische Single-Page-App wird vom Flask-Server ausgeliefert.
Jeder Klick auf „Senden" geht an `/api/proxy`, von dort an die echte OktoPOS-URL.
Damit gibt es keine CORS-Probleme im Browser.

## Files

```
.
├── Dockerfile            # Container-Definition
├── docker-compose.yml    # Einfacher Start
├── requirements.txt      # Python-Abhängigkeiten
├── app.py                # Flask-Backend (Proxy + Routes)
├── templates/
│   └── index.html        # HTML der Single-Page-App
└── static/
    ├── style.css         # Styling
    └── app.js            # Frontend-Logik
```

## Hinweise

- Falls deine OktoPOS-Instanz ein anderes Auth-Schema nutzt (z.B. `Authorization: Bearer`
  statt `X-API-Key`), kannst du das in den Einstellungen umstellen.
- Falls dein Server selbstsignierte Zertifikate verwendet, muss der Container das CA-Cert kennen.
- API-Doku: <https://oktopos-manager.pages.oktopos.net/api-public/api-doc/customer.html>
