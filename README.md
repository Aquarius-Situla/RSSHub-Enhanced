[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin Deployment & Management Panel

![License](https://img.shields.io/github/license/Aquarius-Situla/RSSHub-Enhanced)
[![RSSHub](https://img.shields.io/badge/RSSHub-Supported-FF69B4?logo=rss&logoColor=white)](https://docs.rsshub.app/)
[![NPM](https://img.shields.io/badge/Nginx%20Proxy%20Manager-Supported-009688?logo=nginx&logoColor=white)](https://nginxproxymanager.com/)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)

A visual management panel for RSSHub and Gost proxy built with Node.js and React. It natively supports Apple's design aesthetics (perfectly adapted for both mobile and desktop), supports one-click bilingual (English/Simplified Chinese) switching, and enables zero-threshold maintenance for your RSSHub and CookieCloud nodes!

## 🌟 Features

- **Seamless Cross-Platform Adaptation**: Perfectly replicates macOS system settings sidebar and iOS smooth scrolling experience.
- **Gost Node Visual Management**: Add, delete, query, and modify Gost load balancing proxy nodes. Supports independent node authentication (Auth), max fail counts, fail timeouts, and bypass rules editing.
- **CookieCloud One-Click Auto Sync**: Seamlessly integrates CookieCloud accounts and Bilibili UIDs, supporting one-click forced fetch, decryption, and environment variable synchronization.
- **Automatic Language Detection**: Automatically detects browser fingerprints to smartly render the UI in English or Chinese.

---

## 🛠️ Deployment Prerequisites

This project is designed to be deployed on Linux (e.g., Debian, Ubuntu) and depends on the following components:

- Docker & Docker Compose
- Node.js (For running the Admin panel backend)
- Python3 and necessary cryptographic libraries (For CookieCloud decryption scripts)

### Privacy & Security Guidelines (Must Read)
**⚠️ Do NOT hardcode any private keys directly into the source code!**
This project fully supports the environment variable security mechanism. All sensitive data (such as `ACCESS_KEY`, `YOUTUBE_KEY`, `CookieCloud Passwords`, etc.) are managed dynamically via `.env`. Please ensure that your `.env` file is added to `.gitignore`!

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
- `url` **(Required)**: The `IP:Port` of the target proxy server.
- `auth` *(Optional)*: Node authentication info. Supports `username:password` format or just `password`. Leave blank or omit this field if authentication is not required.
- `maxFails` *(Optional)*: Max retry count. Recommended: `"3"`.
- `failTimeout` *(Optional)*: Fail timeout duration. Recommended: `"30s"`.
- `bypass` *(Optional)*: `true` or `false`. If enabled, this node will utilize the direct connection rules specified in `bypass.txt` via the panel.

---

## 🌐 Nginx Proxy Manager (NPM) Setup Guide

Since RSSHub needs to be public for RSS readers, while the `/admin` panel controls your private nodes and cookies, **we must NOT lock down the entire domain**. To achieve **"Protecting only the /admin panel"**, please paste the appropriate Nginx routing code block into the **Advanced** tab of your NPM proxy configuration, depending on your authentication method:

### Option A: Use NPM Built-in Basic Auth
Ideal for most individual users looking for a simple setup:

```nginx
# Proxy RSSHub core service (Public by default)
location / {
    proxy_pass http://rsshub:1200/;
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
    
    proxy_pass http://rsshub-admin:3000/;
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
    proxy_pass http://situla-auth:3000/verify;
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
    proxy_pass http://rsshub:1200/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 4. Proxy the Admin Panel and enable situla-auth interception check
location ^~ /admin/ {
    # Enable request authentication (unified verification via /_auth)
    auth_request /_auth;
    
    proxy_pass http://rsshub-admin:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

---

## 📜 Advanced Route Modding Reminder (Memo)
If you ever plan to modify native RSSHub route files (like customizing Bilibili templates) by mounting an external folder such as `rsshub-config`, please be mindful of the host folder permissions. The container must have read access to the mounted folder:
```bash
# Example: Grant global read permissions to the external config folder to prevent 403 errors in the RSSHub container
chmod -R 644 /opt/rsshub/rsshub-config/
```
