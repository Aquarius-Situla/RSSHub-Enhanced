[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin Deployment & Management Panel

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

## 🌐 Nginx Proxy Manager (NPM) Setup Guide

If you are using NPM as your reverse proxy, please follow these steps to configure your domain and secure the `/admin` panel:

1. **Reverse Proxy & `/admin` Route Configuration**:
   Create a new Proxy Host in NPM (e.g., `rss.yourdomain.com`):
   - **Details -> Forward Hostname / IP**: `rsshub`
   - **Details -> Forward Port**: `1200`
   - **Custom Locations -> Add Location**:
     - **Location**: `/admin`
     - **Forward Hostname / IP**: `rsshub-admin`
     - **Forward Port**: `3000`

2. **Configure Auth (Security Access Control)**:
   The admin panel directly manages your nodes and CookieCloud secrets. To prevent unauthorized access, you **MUST** set up Basic Auth in NPM.
   - Go to **Access Lists** in the top menu of NPM and create a new list (e.g., `RSSHub Admin Auth`).
   - In the `Authorization` tab, add your personal username and password.
   - Finally, go back to your Proxy Host `Details` page, select this newly created list from the `Access List` dropdown menu, and save.

---

## 📜 Advanced Route Modding Reminder (Memo)
If you ever plan to modify native RSSHub route files (like customizing Bilibili templates) by mounting an external folder such as `rsshub-config`, please be mindful of the host folder permissions. The container must have read access to the mounted folder:
```bash
# Example: Grant global read permissions to the external config folder to prevent 403 errors in the RSSHub container
chmod -R 644 /opt/rsshub/rsshub-config/
```
