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

## 📌 Overview / Giới Thiệu

Hệ thống tự động hóa 100% trên Cloud (GitHub Actions), chạy định kỳ lúc **06:00 AM hàng ngày** (GMT+7):
1. **GitHub Discovery Engine:** Quét và phân tích các kho lưu trữ trending / breakout trên GitHub trong 24–48h qua (AI, Agent, MCP, DevTools).
2. **LLM Synthesis:** Sử dụng **Google Gemini** lọc nhiễu, đánh giá tiềm năng kỹ thuật và tóm tắt 3–5 repo xuất sắc nhất.
3. **Instant Telegram Delivery:** Gửi bản tin markdown định dạng trực quan thẳng về Telegram channel / bot cá nhân.

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

## 🚀 Hướng Dẫn Kích Hoạt Nhanh (3 Phút)

### Bước 1: Khởi Tạo Telegram Bot (30s)
1. Mở Telegram, tìm kiếm **`@BotFather`**.
2. Gửi lệnh `/newbot` và đặt tên bot (ví dụ: `My Tech Digest`) cùng username (ví dụ: `zuan_digest_bot`).
3. Lưu lại **HTTP API Token** được cấp (`1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ`).

### Bước 2: Lấy Chat ID (10s)
1. Tìm bot **`@userinfobot`** (hoặc `@getmyid_bot`) trên Telegram và bấm **Start**.
2. Copy con số `Id` (ví dụ: `987654321`).
3. *Lưu ý:* Nhớ mở khung chat với bot bạn vừa tạo ở Bước 1 và bấm **Start** để cho phép bot gửi tin nhắn.

### Bước 3: Lấy Google Gemini API Key (10s)
1. Truy cập [aistudio.google.com](https://aistudio.google.com/) (đăng nhập Google).
2. Chọn **Get API key** $\rightarrow$ **Create API key** và copy mã khóa.

### Bước 4: Cấu Hình Secrets Trên GitHub
Vào repository GitHub của bạn $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ Thêm 3 secrets:
* `TELEGRAM_BOT_TOKEN`: Token lấy từ @BotFather.
* `TELEGRAM_CHAT_ID`: ID lấy từ @userinfobot.
* `GEMINI_API_KEY`: API Key lấy từ AI Studio.

---

## ⚡ Kiểm Tra Ngay (Manual Trigger)

1. Mở tab **Actions** trên GitHub repository.
2. Chọn workflow **Daily GitHub Trending Telegram Digest**.
3. Bấm **Run workflow** $\rightarrow$ **Run workflow**.
4. Sau 20–30 giây, Telegram sẽ nhận ngay bản tin digest đầu tiên!

---

## 📄 License

Dự án phát hành dưới giấy phép [MIT License](LICENSE).
