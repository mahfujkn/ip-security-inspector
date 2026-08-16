# 🛡️ IP & Security Inspector

<div align="center">

<img src="icons/icon128.png" width="100" height="100" alt="IP & Security Inspector Logo" style="border-radius: 22px;" />

### 🌐 Powerful, High-Performance IP & Security Inspection Extension for Chromium Browsers

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline-green.svg)
![Security](https://img.shields.io/badge/Security-Security%20Focused-purple.svg)

[**Download Release (.ZIP)**](https://github.com/mahfujkn/ip-security-inspector/releases) • [**Features**](#-features) • [**Installation**](#-installation-guide) • [**Screenshots**](#-screenshots) • [**Technology Stack**](https://github.com/mahfujkn/ip-security-inspector#-technology-stack)

</div>

---

## 📖 Overview

**IP & Security Inspector** is a powerful, high-performance browser extension designed to inspect and analyze your current network and security environment directly from your browser.

It provides detailed information about your public **IPv4/IPv6 addresses**, active tab server details, geolocation, ISP provider, fraud threat risk score, VPN/Proxy detection, WebRTC leaks, timezone mismatches, latency, country information, and currency mapping.

---

## ✨ Features

- 🌐 **Public IPv4 & IPv6 Inspection**: Displays your real public IP addresses with instant one-click copy and auto-copy capabilities.
- 🏢 **Active Tab Server Geolocation**: Captures the current website's host server IP, hosting provider, ASN, and server location in real time.
- ⚡ **3-Tier Anycast Latency Checker**:
  - **1st Tier**: Cloudflare `1.1.1.1` Edge
  - **2nd Tier**: Google Public DNS
  - **3rd Tier**: Quad9 Secure DNS
- 🚩 **250+ HD World Country Flags & ISO Badges**:
  - Dedicated 32x32 HD country flag icons.
  - Coverage for all 250 ISO country codes.
  - Dynamic toolbar badges with Green for Clean residential and Red for VPN/Proxy.
- 🛡️ **VPN & Datacenter Detection**:
  - Identifies commercial hosting datacenters including GSL Networks, Vultr, AWS, Hetzner, and Cloudflare.
  - Calculates a real-time Fraud Threat Score from 0%–100%.
- 🔒 **WebRTC Leak & Timezone Checker**:
  - Scans STUN candidates for unmasked local IP leaks.
  - Detects mismatches between system local time and IP location time.
- 💱 **Global Currency Mapping**: Displays official currency ISO codes and symbols for over 250 countries, including BDT ৳, USD $, KHR ៛, EUR €, and INR ₹.

---

## 📸 Screenshots

<div align="center">

### 1. My Connection Overview

<img src="screenshots/my-connection.png" alt="My Connection Overview" />

---

### 2. Active Tab Server Geolocation

<img src="screenshots/active-tab-server.png" alt="Active Tab Server Geolocation" />

</div>

---

## 🚀 Installation Guide

### Method 1: Download Release ZIP (Quickest & Easiest)

1. Go to the official [**GitHub Releases Page**](https://github.com/mahfujkn/ip-security-inspector/releases).
2. Download the **`IP-Security-Inspector-v1.0.zip`** package from the latest release assets.
3. Extract the downloaded ZIP file to a folder on your computer.
4. Open your browser extensions page:
   - **Google Chrome:** navigate to `chrome://extensions/`
   - **Microsoft Edge:** navigate to `edge://extensions/`
5. Enable **Developer mode** in the top-right / sidebar corner.
6. Click **Load unpacked** and select the extracted folder.
7. 🎉 **IP & Security Inspector** is now installed. Its icon will appear on your browser toolbar.

---

### Method 2: Git Clone (Developer Mode)

1. **Clone the repository**

   ```bash
   git clone https://github.com/mahfujkn/ip-security-inspector.git
   ```

2. Open your browser extensions page:
   - **Google Chrome:** `chrome://extensions/`
   - **Microsoft Edge:** `edge://extensions/`

3. Enable **Developer mode**.

4. Click **Load unpacked** and select the **`ip-security-inspector`** repository folder.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Extension Framework** | Manifest V3 (Service Worker Architecture) |
| **Languages** | HTML5, Modern Vanilla JavaScript (ES6+), CSS3 |
| **Design System** | Custom Dark/Light Theme with glassmorphism & responsive text wrapping |
| **Geolocation APIs** | Parallel multi-provider fallback engine (`ip-api.com`, `ipwho.is`, `freeipapi.com`, `ipapi.co`, APNIC RDAP Registry) |

---

## 👨‍💻 Author & Developer

Developed with ❤️ by **[Mahfuj Khan Rafsan](https://zaap.bio/mahfuj)**

---

## 📄 License

This project is distributed under the **MIT License** — see `LICENSE` for more information.
