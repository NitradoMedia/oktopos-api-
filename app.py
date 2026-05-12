"""
Oktopos API Test Interface
A small Flask-based proxy + web UI for testing the Oktopos Customer API.
"""
import os
import requests
from flask import Flask, request, jsonify, render_template, Response

app = Flask(__name__, static_folder="static", template_folder="templates")

# Default base URL (can be overridden by the frontend per request)
DEFAULT_BASE_URL = os.environ.get(
    "OKTOPOS_BASE_URL",
    "https://oktopos-manager.pages.oktopos.net"
)
DEFAULT_API_KEY = os.environ.get("OKTOPOS_API_KEY", "")

# Allowed timeout for upstream requests (seconds)
REQUEST_TIMEOUT = int(os.environ.get("OKTOPOS_TIMEOUT", "30"))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok"})


@app.route("/api/proxy", methods=["POST"])
def proxy():
    """
    Generic proxy. The frontend sends a JSON body of the form:
    {
        "baseUrl":   "https://my-oktopos-instance.example.com",
        "apiKey":    "...",
        "authHeader":"X-API-Key",        # optional, default X-API-Key
        "authStyle": "header" | "bearer", # optional
        "method":    "GET" | "POST" | "PUT" | "DELETE",
        "path":      "/v1/customers/check-balance/B1S2D",
        "query":     { "number": "+49..." },   # optional
        "body":      { ... },             # optional JSON body
        "contentType": "application/json" # optional, default application/json
    }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    base_url = (data.get("baseUrl") or DEFAULT_BASE_URL).rstrip("/")
    api_key = data.get("apiKey") or DEFAULT_API_KEY
    auth_header = data.get("authHeader") or "X-API-Key"
    auth_style = (data.get("authStyle") or "header").lower()
    method = (data.get("method") or "GET").upper()
    path = data.get("path") or "/"
    query = data.get("query") or {}
    body = data.get("body")
    content_type = data.get("contentType") or "application/json"

    if not path.startswith("/"):
        path = "/" + path

    url = f"{base_url}{path}"

    headers = {
        "Accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = content_type

    if api_key:
        if auth_style == "bearer":
            headers["Authorization"] = f"Bearer {api_key}"
        else:
            headers[auth_header] = api_key

    try:
        if method in ("GET", "DELETE"):
            r = requests.request(
                method, url,
                headers=headers,
                params=query,
                timeout=REQUEST_TIMEOUT,
            )
        else:
            if content_type == "application/json":
                r = requests.request(
                    method, url,
                    headers=headers,
                    params=query,
                    json=body,
                    timeout=REQUEST_TIMEOUT,
                )
            else:
                r = requests.request(
                    method, url,
                    headers=headers,
                    params=query,
                    data=body,
                    timeout=REQUEST_TIMEOUT,
                )
    except requests.exceptions.ConnectionError as e:
        return jsonify({
            "error": "Connection error",
            "detail": str(e),
            "url": url,
        }), 502
    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Upstream timeout",
            "url": url,
        }), 504
    except Exception as e:
        return jsonify({
            "error": "Proxy error",
            "detail": str(e),
            "url": url,
        }), 500

    # Build response: include status, headers, body (json if possible)
    response_payload = {
        "status": r.status_code,
        "url": r.url,
        "method": method,
        "headers": dict(r.headers),
    }
    text = r.text
    try:
        response_payload["json"] = r.json()
    except ValueError:
        response_payload["text"] = text

    return jsonify(response_payload), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)
