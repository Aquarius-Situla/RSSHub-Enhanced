[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin 部署与管理面板

[![License](https://img.shields.io/github/license/Aquarius-Situla/RSSHub-Enhanced)](https://github.com/Aquarius-Situla/RSSHub-Enhanced/blob/main/LICENSE) &nbsp;&nbsp; [![RSSHub](https://img.shields.io/badge/RSSHub-Supported-FF69B4?logo=rss&logoColor=white)](https://docs.rsshub.app/) &nbsp;&nbsp; [![NPM](https://img.shields.io/badge/Nginx%20Proxy%20Manager-Supported-009688?logo=nginx&logoColor=white)](https://nginxproxymanager.com/) &nbsp;&nbsp; [![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)](https://www.docker.com/)

一个基于 Node.js 和 React 的 RSSHub 与 Gost 代理可视化管理面板。原生支持 Apple 设计风格（支持移动端/桌面端完美适配），支持双语（简体中文/English）一键切换，实现零门槛维护您的 RSSHub 和 CookieCloud 节点！

## 🌟 特性

- **无感多端适配**：完美复刻 macOS 系统设置的侧边栏与 iOS 移动端平滑滚动体验。
- **Gost 节点可视化管理**：可增删查改 Gost 负载均衡代理节点，支持节点独立认证（Auth）、最大失败次数、超时时间、bypass 直连规则编辑。
- **CookieCloud 一键自动同步**：无缝对接 CookieCloud 账号与 B站 UID，支持一键强制拉取、解密并同步至环境变量。
- **自动检测系统语言**：浏览器指纹自动检测，智能渲染中文或英文。

---

## 🛠️ 部署前置要求

该项目默认部署在 Linux (如 Debian, Ubuntu) 架构下，依赖以下组件：

- Docker & Docker Compose
- Node.js (用于运行 Admin 面板后端)
- Python3 及必要的加密库 (用于 CookieCloud 解密脚本)

### 隐私与安全指南 (必看)
**⚠️ 请勿将任何私密密钥直接硬编码进源代码！**
本项目已全面适配环境变量安全机制。所有的敏感数据（例如 `ACCESS_KEY`, `YOUTUBE_KEY`, `CookieCloud 密码` 等）统一由系统通过 `.env` 或动态挂载处理。请务必将 `.env` 添加进 `.gitignore` 中！

**配置方式：**
首次部署前，请复制根目录下的 `.env.example` 文件并重命名为 `.env`，然后填入您自己的真实密钥：
```bash
cp .env.example .env
```

---

## 🚀 JSON 批量导入代理节点格式

面板中的 **“上传”** 功能支持批量载入您的 Gost 节点池。JSON 文件需符合以下数组对象结构：

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

### 字段说明：
- `url` **(必填)**: 目标代理服务器的 `IP:Port`。
- `auth` *(可选)*: 节点的验证信息，支持 `用户名:密码` 格式，或直接填写 `密码`。若不需要验证请留空或不写此字段。
- `maxFails` *(可选)*: 失败重试次数，推荐值 `"3"`。
- `failTimeout` *(可选)*: 失败判定超时时间，推荐值 `"30s"`。
- `bypass` *(可选)*: `true` 或 `false`，开启后此节点将使用面板中配置的 `bypass.txt` 直连规则。

---

## 🌐 Nginx Proxy Manager (NPM) 配置指南

由于 RSSHub 需要对外公开给阅读器，而 `/admin` 面板直接控制您的隐私节点和 Cookie，因此我们**绝不能直接把整个域名锁死**。为了实现**“只保护 /admin 面板”**，请在 NPM 代理配置的 **Advanced (高级)** 选项卡中，根据您的鉴权方式填入以下相应的 Nginx 官方路由代码块：

### 方案 A：使用 NPM 内置密码本 (Basic Auth) 保护
适合绝大多数个人用户的极简方案：

```nginx
# 代理 RSSHub 核心服务（默认全网公开）
location / {
    proxy_pass http://rsshub:1200/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 代理管理面板并启用基础密码保护
location ^~ /admin/ {
    # 启用名为 RSSHub-Admin 的基础认证
    auth_basic "RSSHub-Admin";
    
    # 密码文件路径。请先在 NPM 面板创建好一个 Access List。
    # 例如：auth_basic_user_file /data/access/1; (其中 1 是 NPM 里 Access List 的 ID)
    auth_basic_user_file /data/access/your_auth_file;
    
    proxy_pass http://rsshub-admin:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 方案 B：使用 situla-auth (SSO) 统一鉴权保护
适合部署了 `situla-auth` 容器，希望实现全局单点登录的高阶用户：

```nginx
# 1. 定义内部路由：转发鉴权请求至 situla-auth 容器
location = /_auth {
    internal;
    # 在同属 npm_default 网络下，通过容器名及内部端口直接访问
    proxy_pass http://situla-auth:3000/verify;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}

# 2. 配置 401 未授权处理：拦截并重定向至统一登录页
error_page 401 = @error401;
location @error401 {
    # 请将 auth.example.com 替换为您真实的 situla-auth 登录域名
    return 302 https://auth.example.com/?rd=https://$http_host$request_uri;
}

# 3. 代理 RSSHub 核心服务（默认全网公开）
location / {
    proxy_pass http://rsshub:1200/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 4. 代理管理面板并启用 situla-auth 拦截校验
location ^~ /admin/ {
    # 开启请求鉴权（统一经由 /_auth 校验）
    auth_request /_auth;
    
    proxy_pass http://rsshub-admin:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

---

## 📜 高阶路由魔改提醒 (备忘录)
如果您未来希望通过挂载类似 `rsshub-config` 这样的外部文件夹，来魔改 RSSHub 的原生路由文件（例如修改 Bilibili 的路由或模板），请务必注意宿主机的文件夹权限问题。您必须授权容器读取该文件夹：
```bash
# 举例：赋予外挂配置文件夹全局读取权限，防止 RSSHub 容器因权限不足引发错误
chmod -R 644 /opt/rsshub/rsshub-config/
```
