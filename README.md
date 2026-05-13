<div align="center">

# 🐙 OktoPOS API Tester

**Ein dockerisiertes Web-Interface zum Testen der OktoPOS Customer API.**

Built with ❤ by **[NitradoMedia LLC](https://github.com/NitradoMedia)**

[![License: MIT](https://img.shields.io/badge/license-MIT-7c5cff.svg)](#lizenz)
[![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)](#schnellstart)
[![Built by NitradoMedia](https://img.shields.io/badge/built%20by-NitradoMedia%20LLC-29d1c1.svg)](https://bizfileonline.sos.ca.gov/)

</div>

---

## Über dieses Projekt

Der **OktoPOS API Tester** ist ein internes Werkzeug von NitradoMedia LLC zum schnellen,
visuellen Testen der [OktoPOS Customer API](https://oktopos-manager.pages.oktopos.net/api-public/api-doc/customer.html).
Du gibst deinen API-Key und die Base-URL deiner OktoPOS-Instanz direkt im Browser ein,
und kannst dann alle Endpunkte mit ein paar Klicks ausprobieren — kein Postman, kein Curl, keine CORS-Probleme.

## Features

-    keine Installation nötig, nur Browser
-    API-Key & Base-URL werden **nur lokal** im Browser (localStorage) gespeichert
-    Eingebauter Python-Proxy – keine CORS-Probleme
-    Komplette Customer-API abgedeckt:
  - `POST /v1/customers` – Kunden anlegen
  - `GET  /v1/customers/findByExternalIdentifier/{externalIdentifier}`
  - `GET  /v1/customers/findByPhoneNumber`
  - `POST /v1/customers/createVoucherAccount`
  - `GET  /v1/customers/check-balance/{cardNumber}`
  - `POST /v1/customers/recharge-balance`
-   „Verbindung testen"-Button für schnellen Health-Check
-   Volle Transparenz: angezeigte URL, HTTP-Methode, Request-Body, Response, Statuscode und Dauer
-   JSON-Syntax-Highlighting
-   Vorausgefüllte JSON-Beispiele für komplexe Endpunkte
-   
## Schnellstart

### Variante A: docker compose (empfohlen)

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
| **Base URL** | URL deiner OktoPOS-Instanz, **ohne** `/v1` am Ende (z.B. `https://manager.deine-firma.tld`) |
| **API Key** | Der API-Key aus deinem OktoPOS Manager (siehe `OktoPOS → System`) |
| **Auth-Stil** | `Header` (Standard) oder `Authorization: Bearer …` |
| **Auth-Header** | Header-Name (Default `X-API-Key`) |

Optional als Container-Env-Variable:

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

## Verzeichnisstruktur

```
.
├── Dockerfile             # Container-Definition
├── docker-compose.yml     # Einfacher Start
├── requirements.txt       # Python-Abhängigkeiten
├── app.py                 # Flask-Backend (Proxy + Routes)
├── templates/
│   └── index.html         # HTML der Single-Page-App (inkl. Impressum-Modal)
└── static/
    ├── style.css          # Dark-Theme Styling
    └── app.js             # Frontend-Logik
```

## Hinweise

- Falls deine OktoPOS-Instanz ein anderes Auth-Schema nutzt (z.B. `Authorization: Bearer`
  statt `X-API-Key`), kannst du das in den Einstellungen umstellen.
- Falls dein Server selbstsignierte Zertifikate verwendet, muss der Container das CA-Cert kennen.
- API-Doku: <https://oktopos-manager.pages.oktopos.net/api-public/api-doc/customer.html>

## Lizenz

MIT © NitradoMedia LLC

---

## Über NitradoMedia LLC

**NitradoMedia LLC** ist eine in Kalifornien registrierte LLC.
Vollständige Anbieter-Informationen findest du im integrierten Impressum der Web-App
(Sidebar → ⚖ Impressum) oder unten:

> **NitradoMedia LLC**
> 770 County Square Drive
> Ventura, CA 93003, USA
>
> **CEO:** Stefan McFarland
> **Telefon (US):** +1 725-254-7661
> **Telefon (DE):** +49 174 8406835
> **E-Mail:** info@nitradomedia.com
>
> Entity No.: 202357118071 · Registriert in California
> Registerbehörde: [bizfileonline.sos.ca.gov](https://bizfileonline.sos.ca.gov/)

---

<div align="center">

🐙 *Crafted with care in California & Germany.*

</div>
