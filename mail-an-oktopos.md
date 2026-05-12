# E-Mail an OktoPOS-Support

**Betreff:** API-Anfrage zur Abfrage der Kunden-E-Mail-Adresse

---

Hallo,

vielen Dank für die schnelle Rückmeldung.

Mein Ziel ist es, zu einer gegebenen **Kartennummer** die zugehörige **E-Mail-Adresse** des Kunden über die Customer-API abzurufen. In der öffentlichen Doku (<https://oktopos-manager.pages.oktopos.net/api-public/api-doc/customer.html>) finde ich keinen Endpunkt, der direkt nach Kartennummer einen vollständigen Kundendatensatz zurückliefert. `findByPhoneNumber` liefert zwar das komplette Kundenobjekt inkl. `person.email` und `externalIdentifier`, aber die Telefonnummer liegt mir nicht immer vor.

Als Versuch habe ich zunächst den `check-balance`-Endpunkt aufgerufen — auch wenn dessen Antwort laut Doku keine E-Mail enthält, hatte ich gehofft, daraus zumindest die `externalIdentifier` ableiten zu können, um danach `findByExternalIdentifier` zu nutzen. Die konkrete Anfrage war:

```
GET https://<meine-instanz>.oktopos.<tld>/v1/customers/check-balance/<KARTENNUMMER>
Header: X-API-Key: <unser-api-key>
Header: Accept: application/json
```

Die Antwort kam mit **HTTP 404** und folgendem Body:

```json
{
  "items": [],
  "messages": [
    {
      "data": {
        "action": "customers",
        "controller": "v1",
        "module": "v1",
        "request_time": "2026-05-12T13:55:44+02:00"
      },
      "index": -1,
      "text": "unexpected error, contact support api@oktopos.com",
      "text_ns": "default.error.controller",
      "type": "error"
    }
  ],
  "success": false,
  "timestamp": 1778586944,
  "version": "3.93.4"
}
```

Daraus ergeben sich für mich zwei Fragen:

1. **Pfad-Schreibweise:** Stimmt der Pfad `check-balance/{cardNumber}` mit Bindestrich so, oder erwartet die API eine andere Schreibweise? Die übrigen Endpunkte in der Doku nutzen CamelCase (z.B. `findByPhoneNumber`, `findByExternalIdentifier`, `createVoucherAccount`), nur `check-balance` und `recharge-balance` sind mit Bindestrich aufgeführt — das ist mir aufgefallen, weil die Fehlermeldung 404 darauf hindeuten könnte, dass das Routing den Pfad nicht erkennt.

2. **Empfohlener Weg zur E-Mail-Abfrage:** Welcher Endpunkt ist aus Ihrer Sicht der korrekte Weg, um zu einer **Kartennummer** die zugehörige **E-Mail-Adresse** (bzw. die `externalIdentifier`) zu bekommen? Falls dafür ein eigener oder erweiterter API-Endpunkt existiert, der in der öffentlichen Doku noch nicht beschrieben ist, wäre ich für einen kurzen Hinweis sehr dankbar.

Viele Grüße
Stefan
