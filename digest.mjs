// digest.mjs — Tự động quét GitHub Trending, dùng Gemini Pro/Flash phân tích và gửi về Telegram
// Chạy trên Node.js 18+ (Không cần cài thêm thư viện npm nào, dùng native fetch)

async function fetchTrendingRepos() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Tìm các repository hot được tạo hoặc tăng stars đột biến gần đây
  const queries = [
    `stars:>50 created:>${threeDaysAgo} sort:stars-desc`,
    `topic:ai-agent stars:>30 pushed:>${threeDaysAgo} sort:updated-desc`,
    `topic:mcp stars:>10 pushed:>${threeDaysAgo} sort:updated-desc`
  ];

  const allRepos = [];
  const seenUrls = new Set();

  for (const q of queries) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=10`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Daily-GitHub-Digest-Bot',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const repo of (data.items || [])) {
        if (!seenUrls.has(repo.html_url)) {
          seenUrls.add(repo.html_url);
          allRepos.push({
            name: repo.full_name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            description: repo.description || 'Không có mô tả',
            language: repo.language || 'General',
            topics: (repo.topics || []).slice(0, 5)
          });
        }
      }
    } catch (err) {
      console.error('Lỗi khi fetch GitHub API:', err.message);
    }
  }

  return allRepos.slice(0, 20);
}

async function summarizeWithGemini(repos, apiKey) {
  const reposText = repos.slice(0, 12).map((r, i) => 
    `${i + 1}. [${r.name}](${r.url}) (⭐ ${r.stars} | ${r.language})\n   Mô tả: ${r.description}`
  ).join('\n');

  const prompt = `Bạn là một Tech Lead / Senior AI Engineer sành sỏi.
Dưới đây là danh sách các repository đang nổi bật trên GitHub gần đây:
${reposText}

Nhiệm vụ của bạn:
1. Hãy chọn lọc ra từ 3 đến 5 dự án XUẤT SẮC, ĐÁNG THỬ VÀ ĐÁNG XEM NHẤT (ưu tiên AI agent, công cụ dev, automation, open-source thú vị).
2. Viết bản tin sáng ngắn gọn, sắc bén bằng tiếng Việt gửi qua Telegram.

Yêu cầu định dạng bản tin Telegram (dùng định dạng HTML để hiển thị đẹp):
- Tiêu đề: 🚀 <b>BẢN TIN GITHUB SÁNG NAY (6:00 AM)</b>
- Với mỗi repo được chọn:
  • <b><a href="URL_REPO">Tên Repo</a></b> (⭐ Số stars | Ngôn ngữ)
  • <b>Giải quyết gì:</b> Tóm tắt cốt lõi 1-2 câu ngắn gọn.
  • <b>Điểm đáng thử:</b> Lý do vì sao dev nên xem hoặc thử nghiệm hôm nay.
- Cuối bản tin: 1 câu đúc kết xu hướng công nghệ nổi bật trong ngày.

LƯU Ý: Tuyệt đối không viết lan man, dùng thẻ HTML an toàn (<b>, <a>, <i>, <code>). Không dùng markdown để tránh lỗi parse của Telegram.`;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-flash-latest'
  ];

  let lastError = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Đang gọi mô hình ${model} (lần thử ${attempt})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            console.log(`✅ Mô hình ${model} đã hoàn thành phân tích xuất sắc.`);
            return data.candidates[0].content.parts[0].text;
          }
        }

        const errorText = await res.text();
        console.warn(`Cảnh báo: ${model} trả về mã ${res.status}: ${errorText.slice(0, 100)}...`);
        lastError = new Error(`Gemini API error (${res.status}): ${errorText}`);

        // Nếu gặp lỗi 503 hoặc 429, chờ 3 giây rồi thử lại
        if (res.status === 503 || res.status === 429) {
          console.log(`Máy chủ Google đang bận, chờ 3 giây trước khi tiếp tục...`);
          await new Promise(r => setTimeout(r, 3000));
        } else {
          break; // Lỗi khác thì chuyển model tiếp theo ngay
        }
      } catch (err) {
        lastError = err;
        console.warn(`Lỗi mạng khi gọi ${model}: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến bất kỳ mô hình Gemini nào.');
}

async function sendTelegramMessage(botToken, chatId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Telegram API error (${res.status}): ${errorText}`);
  }

  console.log('✅ Đã gửi bản tin thành công qua Telegram!');
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const teleToken = process.env.TELEGRAM_BOT_TOKEN;
  const teleChatId = process.env.TELEGRAM_CHAT_ID;

  if (!geminiKey || !teleToken || !teleChatId) {
    console.error('❌ Thiếu biến môi trường: GEMINI_API_KEY, TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.');
    process.exit(1);
  }

  console.log('🔍 Đang thu thập các repo trending trên GitHub...');
  const repos = await fetchTrendingRepos();
  console.log(`Đã tìm thấy ${repos.length} repos tiềm năng.`);

  if (repos.length === 0) {
    console.log('Không tìm thấy repo nào mới.');
    return;
  }

  console.log('🧠 Đang gửi cho Google Gemini phân tích và chọn lọc...');
  const digest = await summarizeWithGemini(repos, geminiKey);

  console.log('📨 Đang gửi tin nhắn qua Telegram...');
  await sendTelegramMessage(teleToken, teleChatId, digest);
}

main().catch(err => {
  console.error('❌ Lỗi tiến trình:', err);
  process.exit(1);
});
