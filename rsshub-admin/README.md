# RSSHub Admin Panel

A beautifully designed, Apple-style administration panel for managing Gost proxy nodes in your RSSHub `docker-compose.yml` stack.

Built with React (Vite) and Node.js, featuring a glassmorphism UI and batch JSON import capabilities.

## Features
- **Visual Dashboard**: View currently configured Gost proxy nodes.
- **Batch Import**: Easily update dozens of proxies at once via a JSON file.
- **Auto-Restart**: Communicates with the host Docker daemon to restart Gost automatically when changes are applied.
- **Secure Integration**: Designed to be placed behind Nginx Proxy Manager and [Situla-auth](https://github.com/Aquarius-Situla/Situla-auth) for robust Forward Authentication.

## Setup & Installation

### 1. Update `docker-compose.yml`
Add this service to your existing RSSHub `docker-compose.yml`:

```yaml
  rsshub-admin:
    build: ./rsshub-admin
    restart: always
    environment:
      - NODE_ENV=production
      # Path inside container to the compose file
      - COMPOSE_FILE_PATH=/host_data/docker-compose.yml 
    volumes:
      # Mount the directory containing your docker-compose.yml
      - ./:/host_data
      # Mount docker socket to restart gost container
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - npm_default
```

### 2. Configure Nginx Proxy Manager (NPM)

To protect the `/admin` route with Situla-auth, go to your NPM dashboard and edit your RSSHub Proxy Host:

1. Go to the **Custom Locations** tab.
2. Add a new location:
   - **Location**: `/admin`
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `rsshub-admin`
   - **Forward Port**: `3000`
3. Click the gear icon next to your new custom location to open Advanced config, and paste:

```nginx
auth_request /_auth;
error_page 401 =302 https://<YOUR_AUTH_DOMAIN>/?redirect=$scheme://$http_host$request_uri;
```
*(Replace `<YOUR_AUTH_DOMAIN>` with your Situla-auth public domain).*

4. In the main **Advanced** tab of the proxy host, add the internal auth endpoint:

```nginx
location = /_auth {
    internal;
    proxy_pass http://situla-auth:3000/verify;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```

## Batch Import Format

You can import nodes by creating a `.json` file in this format:

```json
[
  {
    "url": "rr://user:password@192.168.1.1:7030",
    "params": "?max_fails=3&fail_timeout=30s -bypass=/bypass.txt"
  },
  {
    "url": "rr://10.0.0.1:8080",
    "params": ""
  }
]
```
