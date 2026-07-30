[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin 部署与管理面板

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

## 🌐 Nginx Proxy Manager (NPM) 配置指南

若您使用 NPM 作为反向代理，请按以下步骤配置您的站点以及 `/admin` 管理面板的安全访问：

1. **反向代理与 `/admin` 路径配置**：
   在 NPM 中新建一个 Proxy Host（例如 `rss.yourdomain.com`）：
   - **Details -> Forward Hostname / IP**: `rsshub`
   - **Details -> Forward Port**: `1200`
   - **Custom Locations -> Add Location**:
     - **Location**: `/admin`
     - **Forward Hostname / IP**: `rsshub-admin`
     - **Forward Port**: `3000`

2. **配置 Auth (安全访问控制)**：
   管理面板直接控制您的节点和 CookieCloud 等私密信息。为了防止未授权访问，**必须**在 NPM 中为其设置 Basic Auth 认证。
   - 在 NPM 面板的顶部菜单栏找到 **Access Lists**，新建一个列表（例如命名为 `RSSHub Admin Auth`）。
   - 在该列表的 `Authorization` 选项卡中，添加一个您的专属用户名和密码。
   - 最后，回到您刚才配置的 Proxy Host，在 `Details` 页面的 `Access List` 下拉菜单中，选中您刚刚创建的 Auth 列表，保存即可。

---

## 📜 高阶路由魔改提醒 (备忘录)
如果您未来希望通过挂载类似 `rsshub-config` 这样的外部文件夹，来魔改 RSSHub 的原生路由文件（例如修改 Bilibili 的路由或模板），请务必注意宿主机的文件夹权限问题。您必须授权容器读取该文件夹：
```bash
# 举例：赋予外挂配置文件夹全局读取权限，防止 RSSHub 容器因权限不足引发错误
chmod -R 644 /opt/rsshub/rsshub-config/
```
