<div align="center">

# ⚡ Daily GitHub Trending Digest — Telegram Bot

**Automated Cloud Pipeline Delivering Curated AI & DevTool Intelligence to Telegram.**  
*Powered by GitHub Actions, Google Gemini 2.0 / 1.5, and Telegram Bot API.*

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Scheduled_Cron-2088FF.svg?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Gemini API](https://img.shields.io/badge/AI-Google_Gemini-8E75C2.svg?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot_API-26A5E4.svg?logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📌 Overview

A 100% serverless cloud automation pipeline running on GitHub Actions, scheduled daily at **06:00 AM (GMT+7)**:
1. **GitHub Discovery Engine:** Scrapes and analyzes trending and breakout GitHub repositories over the past 24–48 hours across AI, Autonomous Agents, MCP, and Developer Tooling.
2. **LLM Synthesis:** Leverages **Google Gemini** to filter out low-signal projects, assess technical substance, and distill key insights for top repositories.
3. **Instant Telegram Delivery:** Formats and broadcasts visual Markdown briefings directly to private Telegram bots or broadcast channels.

```
[ Scheduled Cron (06:00 AM) ]
               │
               ▼
┌──────────────────────────────┐
│  GitHub Trending Scraper     │  ──▶ Query breakout repositories
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Gemini AI Curator & Digest  │  ──▶ Filter slop, synthesize tech insights
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Telegram Broadcast Dispatch │  ──▶ Direct notification to Telegram
└──────────────────────────────┘
```

---

## 🚀 Quick Start (3-Minute Setup)

### Step 1: Create a Telegram Bot (30s)
1. Open Telegram and search for **`@BotFather`**.
2. Send the command `/newbot`, provide a display name (e.g., `My Tech Digest`) and a unique username (e.g., `my_tech_digest_bot`).
3. Copy and save the provided **HTTP API Token** (`1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ`).

### Step 2: Retrieve your Chat ID (10s)
1. Search for **`@userinfobot`** (or `@getmyid_bot`) on Telegram and tap **Start**.
2. Copy your numeric `Id` (e.g., `987654321`).
3. *Note:* Ensure you open a chat with your newly created bot from Step 1 and press **Start** to authorize incoming messages.

### Step 3: Obtain Google Gemini API Key (10s)
1. Navigate to [aistudio.google.com](https://aistudio.google.com/) and sign in with your Google account.
2. Click **Get API key** $\rightarrow$ **Create API key** and copy your token.

### Step 4: Configure GitHub Repository Secrets
Navigate to your GitHub repository $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ Add 3 repository secrets:
* `TELEGRAM_BOT_TOKEN`: The bot token obtained from @BotFather.
* `TELEGRAM_CHAT_ID`: Your chat ID obtained from @userinfobot.
* `GEMINI_API_KEY`: The API key from Google AI Studio.

---

## ⚡ Manual Verification Trigger

1. Navigate to the **Actions** tab in your GitHub repository.
2. Select the **Daily GitHub Trending Telegram Digest** workflow from the left sidebar.
3. Click **Run workflow** $\rightarrow$ **Run workflow**.
4. Within 20–30 seconds, your Telegram client will receive the first live intelligence digest!

---

## 📄 License

Distributed under the [MIT License](LICENSE).
