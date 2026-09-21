# 🚀 Daily GitHub Trending Digest — Telegram Bot

Hệ thống tự động hóa 100% trên Cloud (GitHub Actions), chạy ngầm lúc **06:00 AM hàng ngày** (giờ Việt Nam):
1. Quét các repo hot / trending trên GitHub trong 24-48 giờ qua (AI, Agent, MCP, DevTools).
2. Dùng **Google Gemini Pro / Flash** chọn lọc ra 3–5 repo xuất sắc và đáng thử nghiệm nhất.
3. Bắn thẳng bản tin tóm tắt súc tích bằng tiếng Việt về **Telegram Bot** của bạn!

---

## Hướng Dẫn Kích Hoạt Trong 3 Phút

### Bước 1: Lấy Token Telegram Bot (Mất 30 giây)
1. Mở ứng dụng Telegram trên điện thoại/máy tính, tìm kiếm **`@BotFather`**.
2. Gửi lệnh: `/newbot`.
3. Nhập tên cho bot (ví dụ: `My Tech Digest`) và username cho bot (ví dụ: `zuan_digest_bot`).
4. `@BotFather` sẽ trả về một mã **HTTP API Token** (dạng: `1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ`). Copy mã này.

### Bước 2: Lấy Telegram Chat ID của Bạn (Mất 10 giây)
1. Trên Telegram, tìm kiếm bot **`@userinfobot`** (hoặc `@getmyid_bot`).
2. Bấm **Start**. Bot sẽ gửi lại cho bạn một con số `Id` (ví dụ: `987654321`). Copy số này.
3. *Mẹo:* Đừng quên mở chat với con bot bạn vừa tạo ở Bước 1 và bấm **Start** một lần để cho phép bot gửi tin nhắn cho bạn!

### Bước 3: Lấy Google Gemini API Key (Mất 10 giây)
1. Truy cập [aistudio.google.com](https://aistudio.google.com/) (đăng nhập bằng tài khoản Google Pro).
2. Bấm **Get API key** $\rightarrow$ **Create API key** và copy key.

### Bước 4: Đẩy Project Lên GitHub
Chạy các lệnh sau trong terminal:
```powershell
cd "D:\Coding\daily-github-digest"
git init
git add .
git commit -m "feat: daily github trending telegram bot"
git branch -M main
# Tạo một repo mới trên GitHub (ví dụ: zuan412/daily-github-digest), sau đó liên kết:
git remote add origin https://github.com/zuan412/daily-github-digest.git
git push -u origin main
```

### Bước 5: Cấu Hình 3 Secrets Trên GitHub
Vào repo GitHub của bạn $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ Bấm **New repository secret** và thêm 3 biến:
1. `TELEGRAM_BOT_TOKEN`: Token lấy từ @BotFather.
2. `TELEGRAM_CHAT_ID`: ID lấy từ @userinfobot.
3. `GEMINI_API_KEY`: API Key lấy từ aistudio.google.com.

---

## Kiểm Tra Ngay Lập Tức
Sau khi cấu hình xong, bạn không cần đợi đến 6h sáng:
1. Vào tab **Actions** trên GitHub.
2. Chọn workflow **Daily GitHub Trending Telegram Digest** ở thanh bên trái.
3. Bấm **Run workflow** $\rightarrow$ **Run workflow**.
4. Chỉ sau 20-30 giây, Telegram của bạn sẽ ting ting nhận ngay bản tin đầu tiên!
