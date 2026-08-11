[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin Deployment & Management Panel

> [!IMPORTANT]
> **Author's Notice:** This project was originally created for my own personal convenience. As I am currently preparing for a very important exam, **I will not have time to handle or maintain any issues for the next year.** Thank you for your understanding!

[![License](https://img.shields.io/github/license/Aquarius-Situla/RSSHub-Enhanced)](https://github.com/Aquarius-Situla/RSSHub-Enhanced/blob/main/LICENSE) &nbsp;&nbsp; [![RSSHub](https://img.shields.io/badge/RSSHub-Works%20With-FF69B4?logo=rss&logoColor=white)](https://docs.rsshub.app/) &nbsp;&nbsp; [![CookieCloud](https://img.shields.io/badge/🍪%20CookieCloud-Works%20With-green)](https://github.com/easychen/CookieCloud) &nbsp;&nbsp; [![NPM](https://img.shields.io/badge/Nginx%20Proxy%20Manager-Works%20With-009688?logo=nginx&logoColor=white)](https://nginxproxymanager.com/) &nbsp;&nbsp; [![Docker](https://img.shields.io/badge/Docker-Works%20With-blue?logo=docker)](https://www.docker.com/)

A visual management panel for RSSHub and Gost proxy built with Node.js and React. It natively supports Apple's design aesthetics (perfectly adapted for both mobile and desktop), supports automatic bilingual (English/Simplified Chinese) switching via browser fingerprinting, and enables zero-threshold maintenance for your RSSHub and CookieCloud nodes!

> **Disclaimer**: This is a third-party, community-developed tool and is **not affiliated with or officially maintained by RSSHub**.

> [!WARNING]
> **Security Warning: This management panel is a pure internal tool and DOES NOT include any built-in login interface or authentication module!**
> Because this panel possesses high privileges (it can directly modify proxy nodes, overwrite Cookies, and change core system environment variables), you **MUST** configure front-end security protection such as Basic Auth or SSO for the `/admin` path using reverse proxy tools like Nginx Proxy Manager. **DO NOT expose it directly to the public internet without protection!** (See the [NPM Setup Guide](#-nginx-proxy-manager-npm-setup-guide) at the bottom for details.)

## 🌟 Features

- **Seamless Cross-Platform Adaptation**: Perfectly replicates macOS system settings sidebar and iOS smooth scrolling experience.
- **Gost Node Visual Management**: Add, delete, query, and modify Gost load balancing proxy nodes. Supports independent node authentication (Auth), max fail counts, fail timeouts, and bypass rules editing.
- **CookieCloud One-Click Auto Sync**: Seamlessly integrates CookieCloud accounts and Bilibili UIDs, supporting one-click forced fetch, decryption, and environment variable synchronization.
- **Automatic Language Detection**: Automatically detects browser fingerprints to smartly render the UI in English or Chinese.

> [!WARNING]
> **CookieCloud Risk Control Warning**: Using cookies frequently from a remote IP that differs from your local IP might trigger account risk control mechanisms (resulting in bans or flagged accounts). You can mitigate this by lowering the fetch frequency in your RSS backend (e.g., FreshRSS). Although the author has not experienced bans with this setup, please use it with caution!

---

## 🛠️ Deployment Prerequisites

This project is designed to be deployed on Linux (e.g., Debian, Ubuntu) and depends on the following components:

- Docker & Docker Compose
- Node.js (For running the Admin panel backend)
- Python3 and necessary cryptographic libraries (For CookieCloud decryption scripts)

### Privacy & Security Guidelines (Must Read)
> [!WARNING]
> **Do NOT hardcode any private keys directly into the source code!**
> This project fully supports the environment variable security mechanism. All sensitive data (such as `ACCESS_KEY`, `YOUTUBE_KEY`, `CookieCloud Passwords`, etc.) are managed dynamically via `.env`. Please ensure that your `.env` file is added to `.gitignore`!

**Configuration:**
Before deploying for the first time, please copy the `.env.example` file in the root directory, rename it to `.env`, and fill in your real keys:
```bash
cp .env.example .env
```

---

## 🚀 JSON Bulk Import Proxy Node Format

The **"Upload"** feature in the panel allows you to bulk load your Gost node pool. The JSON file must be an array of objects matching the following structure:

```json
[
  {
    "url": "192.168.1.100:8080",
    "auth": "user:password",
    "maxFails": "3",
    "failTimeout": "30s",
    "bypass": false
  },
  {
    "url": "2.57.20.2:6983",
    "auth": "your_password",
    "bypass": true
  }
]
```

### Field Descriptions:
- `url` **(Required)**: The `IP:Port` of the target proxy server. **Note:** Because the panel utilizes Gost's `rr://` (round-robin) group for load-balancing, currently **only HTTP/HTTPS proxy protocols are supported**. Please do not enter `socks5://` or other protocols here; just enter `IP:Port` (defaults to HTTP).
- `auth` *(Optional)*: Node authentication info. Supports `username:password` format or just `password`. Leave blank or omit this field if authentication is not required.
- `maxFails` *(Optional)*: Max retry count. Recommended: `"3"`.
- `failTimeout` *(Optional)*: Fail timeout duration. Recommended: `"30s"`.
- `bypass` *(Optional)*: `true` or `false`. If enabled, this node will utilize the direct connection rules specified in `bypass.txt` via the panel.

---

## 🌐 Nginx Proxy Manager (NPM) Setup Guide

Since RSSHub needs to be public for RSS readers, while the `/admin` panel controls your private nodes and cookies, **we must NOT lock down the entire domain**. To achieve **"Protecting only the /admin panel"**, please paste the appropriate Nginx routing code block into the **Advanced** tab of your NPM proxy configuration, depending on your authentication method:

### Option A: Use NPM Built-in Basic Auth (Untested)
Ideal for most individual users looking for a simple setup:

```nginx
# Proxy RSSHub core service (Public by default)
location / {
    set $upstream_rsshub http://rsshub:1200;
    proxy_pass $upstream_rsshub;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Proxy the Admin Panel and enable basic password protection
location ^~ /admin/ {
    # Enable Basic Auth named RSSHub-Admin
    auth_basic "RSSHub-Admin";
    
    # Path to the password file. Please create an Access List in the NPM panel first.
    # Example: auth_basic_user_file /data/access/1; (where 1 is the Access List ID in NPM)
    auth_basic_user_file /data/access/your_auth_file;
    
    rewrite ^/admin/(.*)$ /$1 break;
    set $upstream_admin http://rsshub-admin:3000;
    proxy_pass $upstream_admin;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### Option B: Use situla-auth (SSO) Centralized Authentication
Ideal for advanced users who deploy a `situla-auth` container for global single sign-on:

```nginx
# 1. Define internal route: forward authentication requests to situla-auth container
location = /_auth {
    internal;
    # Access directly via container name and internal port within the npm_default network
    set $upstream_auth http://situla-auth:3000;
    proxy_pass $upstream_auth/verify;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}

# 2. Handle 401 Unauthorized: intercept and redirect to unified login page
error_page 401 = @error401;
location @error401 {
    # Replace auth.example.com with your actual situla-auth login domain
    return 302 https://auth.example.com/?rd=https://$http_host$request_uri;
}

# 3. Proxy RSSHub core service (Public by default)
location / {
    set $upstream_rsshub http://rsshub:1200;
    proxy_pass $upstream_rsshub;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 4. Proxy the Admin Panel and enable situla-auth interception check
location ^~ /admin/ {
    # Enable request authentication (unified verification via /_auth)
    auth_request /_auth;
    
    rewrite ^/admin/(.*)$ /$1 break;
    set $upstream_admin http://rsshub-admin:3000;
    proxy_pass $upstream_admin;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### Option C: Use Authentik (SSO) Centralized Authentication (Untested)
Ideal for users who deploy [Authentik](https://goauthentik.io/) for global single sign-on. Paste this in NPM's Advanced tab:

```nginx
# 1. Forward outpost requests to Authentik
location /outpost.goauthentik.io {
    # Replace authentik:9000 with your actual Authentik server address
    set $upstream_authentik http://authentik:9000;
    proxy_pass $upstream_authentik/outpost.goauthentik.io;
    proxy_set_header Host $host;
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    add_header       Set-Cookie $auth_cookie;
    auth_request_set $auth_cookie $upstream_http_set_cookie;
}

# 2. Proxy RSSHub core service (Public by default)
location / {
    set $upstream_rsshub http://rsshub:1200;
    proxy_pass $upstream_rsshub;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 3. Proxy the Admin Panel and enable Authentik interception check
location ^~ /admin/ {
    auth_request     /outpost.goauthentik.io/auth/nginx;
    error_page       401 = @goauthentik_proxy_signin;
    auth_request_set $auth_cookie $upstream_http_set_cookie;
    add_header       Set-Cookie $auth_cookie;
    
    rewrite ^/admin/(.*)$ /$1 break;
    set $upstream_admin http://rsshub-admin:3000;
    proxy_pass $upstream_admin;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 4. Authentik Proxy Sign-in Redirect
location @goauthentik_proxy_signin {
    internal;
    add_header Set-Cookie $auth_cookie;
    return 302 /outpost.goauthentik.io/start?rd=$request_uri;
}
```

---

## 📜 Advanced Route Modding Reminder (Memo)
> [!WARNING]
> RSSHub no longer supports hot-loading temporary custom routes by volume mounting an external folder (e.g., `rsshub-config`) into the container. If you need to modify native route files or add custom routes, you must now fork the repository, make your code changes directly within your own fork, and build a custom Docker image.

> [!TIP]
> **The "Dark Magic" (Unorthodox) Method for Testing Routes:**
> Since official volume mounting is dead, how do you quickly test a script without rebuilding the entire RSSHub image? 
> Because this Admin Panel is also built on Node.js/Express, you can "hijack" it to run your scraping scripts directly, bypassing the official RSSHub container entirely!
> 1. Copy your route script (e.g., `test_route.js`) into the host's `rsshub-admin` folder.
> 2. Edit `rsshub-admin/server.js` to import and mount it:
>    ```javascript
>    import { myCustomRoute } from './test_route.js';
>    app.get("/temp/my_route", myCustomRoute);
>    ```
> 3. Restart the `rsshub-admin` container. Now you can access your route via `http://<your-ip>:3000/temp/my_route` (or via your Nginx proxy under `/admin/temp/my_route`).

---

## 🙏 Acknowledgments & Open Source Licenses
This project is built upon and inspired by the following incredible open-source projects. We sincerely thank the authors and contributors for their work:

- **[RSSHub](https://github.com/DIYgod/RSSHub)**: The core RSS generation service. Licensed under the AGPL-3.0 License.
- **[Gost](https://github.com/ginuerzh/gost)**: A simple and secure tunnel written in Go, used for node load-balancing. Licensed under the MIT License.
- **[CookieCloud](https://github.com/easychen/CookieCloud)**: A dedicated cookie sync server/extension. Licensed under the GPL-3.0 License.
- **[Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager)**: Used as the recommended reverse proxy and authentication gateway. Licensed under the MIT License.

*All third-party trademarks, logos, and brand names are the property of their respective owners. This project is provided under the [AGPL-3.0 License](LICENSE).*
