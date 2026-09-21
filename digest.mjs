// digest.mjs — Hệ thống đa bản tin: GitHub, Công nghệ & Thời sự gửi Telegram lúc 6:00 AM
// Sử dụng Node.js native fetch, không phụ thuộc thư viện ngoài

const candidateModels = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

// Helper: Gọi Google Gemini với cơ chế tự động thử lại và đổi model dự phòng
async function callGemini(prompt, apiKey) {
  let lastError = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Đang xử lý với model ${model} (lần ${attempt})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
          }
        }

        const errText = await res.text();
        console.warn(`[Gemini] Cảnh báo ${model} (${res.status}): ${errText.slice(0, 100)}...`);
        lastError = new Error(`Gemini error (${res.status})`);

        if (res.status === 503 || res.status === 429) {
          await new Promise(r => setTimeout(r, 3000));
        } else {
          break;
        }
      } catch (e) {
        lastError = e;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến Gemini.');
}

// 1. Cào GitHub Trending Repositories
async function fetchGitHubTrending() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const queries = [
    `stars:>50 created:>${threeDaysAgo} sort:stars-desc`,
    `topic:ai-agent stars:>30 pushed:>${threeDaysAgo} sort:updated-desc`,
    `topic:mcp stars:>10 pushed:>${threeDaysAgo} sort:updated-desc`
  ];

  const repos = [];
  const seen = new Set();

  for (const q of queries) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=10`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Daily-Digest-Bot',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of (data.items || [])) {
        if (!seen.has(r.html_url)) {
          seen.add(r.html_url);
          repos.push({
            name: r.full_name,
            url: r.html_url,
            stars: r.stargazers_count,
            desc: r.description || 'Không có mô tả',
            lang: r.language || 'General'
          });
        }
      }
    } catch (e) {
      console.error('Lỗi fetch GitHub:', e.message);
    }
  }
  return repos.slice(0, 15);
}

// Helper: Cào RSS feed
async function fetchRSS(url, max = 5) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return items.slice(0, max).map(item => {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1] || '';
      const link = (item.match(/<link>(.*?)<\/link>/) || item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/))?.[1] || '';
      const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/))?.[1] || '';
      return {
        title: title.trim(),
        link: link.trim(),
        desc: desc.replace(/<[^>]*>?/gm, '').trim()
      };
    });
  } catch (e) {
    console.error(`Lỗi fetch RSS ${url}:`, e.message);
    return [];
  }
}

// 2. Cào Tin Công Nghệ Nổi Bật (VnExpress Số Hóa + Hacker News)
async function fetchTechNews() {
  const vneTech = await fetchRSS('https://vnexpress.net/rss/so-hoa.rss', 6);
  
  // Lấy top 3 câu chuyện từ Hacker News
  const hnStories = [];
  try {
    const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = await topIdsRes.json();
    for (const id of topIds.slice(0, 4)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const item = await itemRes.json();
      if (item && item.title) {
        hnStories.push({
          title: item.title,
          link: item.url || `https://news.ycombinator.com/item?id=${id}`,
          desc: `Điểm: ${item.score || 0} | Bình luận: ${item.descendants || 0}`
        });
      }
    }
  } catch (e) {
    console.error('Lỗi fetch Hacker News:', e.message);
  }

  return { vn: vneTech, global: hnStories };
}

// 3. Cào Thời Sự Việt Nam & Thế Giới (VnExpress Thời sự + Thế giới)
async function fetchCurrentAffairs() {
  const vnNews = await fetchRSS('https://vnexpress.net/rss/thoi-su.rss', 6);
  const worldNews = await fetchRSS('https://vnexpress.net/rss/the-gioi.rss', 6);
  return { vn: vnNews, world: worldNews };
}

// Gửi tin nhắn Telegram
async function sendTelegram(botToken, chatId, htmlText) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram error (${res.status}): ${err}`);
  }
}

// TẠO BẢN TIN 1: GITHUB & CÔNG NGHỆ (FORM 1)
async function buildTechDigest(repos, techNews, apiKey) {
  const repoList = repos.slice(0, 10).map((r, i) => `${i + 1}. [${r.name}](${r.url}) (⭐ ${r.stars} | ${r.lang}): ${r.desc}`).join('\n');
  const techList = [
    ...techNews.vn.map(t => `[VN Tech] ${t.title} (${t.link}): ${t.desc}`),
    ...techNews.global.map(t => `[Global Tech] ${t.title} (${t.link})`)
  ].join('\n');

  const prompt = `Bạn là Senior AI Architect & Tech Curator.
Dưới đây là dữ liệu về GitHub Trending và Tin tức công nghệ hôm nay:

--- GITHUB REPOSITORIES ---
${repoList}

--- TIN CÔNG NGHỆ TIÊU ĐIỂM ---
${techList}

Hãy tạo BẢN TIN CÔNG NGHỆ SÁNG (Form 1) định dạng chuẩn HTML cho Telegram:
- Tiêu đề: 💻 <b>[TECH & GITHUB RADAR] — BẢN TIN CÔNG NGHỆ 06:00 AM</b>
- Phần 1: <b>🔥 KHO MÃ NGUỒN ĐÁNG THỬ HÔM NAY</b>
  Chọn lọc 3 repo xuất sắc nhất (ưu tiên AI agent, MCP, dev tools):
  • <b><a href="URL">Tên Repo</a></b> (⭐ Stars | Ngôn ngữ)
    - <i>Mục đích:</i> 1 câu ngắn gọn.
    - <i>Điểm đáng thử:</i> Tại sao dev nên xem hoặc clone về thử hôm nay.
- Phần 2: <b>⚡ TIN CÔNG NGHỆ NỔI BẬT</b>
  Chọn lọc 3 tin công nghệ nóng nhất (AI, Big Tech, Đột phá):
  • <b><a href="URL">Tiêu đề tin</a></b>: Tóm tắt 1-2 câu tác động/bản chất tin tức.
- Đúc kết 1 câu xu hướng công nghệ nổi bật trong ngày.

QUY CÁCH: Dùng thẻ HTML hợp lệ (<b>, <a>, <i>, <code>). Không dùng cú pháp Markdown (* hay #) để tránh lỗi parse.`;

  return await callGemini(prompt, apiKey);
}

// TẠO BẢN TIN 2: THỜI SỰ VIỆT NAM & THẾ GIỚI (FORM 2)
async function buildNewsDigest(affairs, apiKey) {
  const vnList = affairs.vn.map(n => `- ${n.title} (${n.link}): ${n.desc}`).join('\n');
  const worldList = affairs.world.map(n => `- ${n.title} (${n.link}): ${n.desc}`).join('\n');

  const prompt = `Bạn là Tổng Biên Tập thời sự quốc tế và đời sống.
Dưới đây là các tin tức thời sự nóng trong ngày:

--- THỜI SỰ VIỆT NAM ---
${vnList}

--- THỜI SỰ THẾ GIỚI ---
${worldList}

Hãy tạo BẢN TIN THỜI SỰ SÁNG (Form 2) phong cách trang nhã, chính luận bằng HTML cho Telegram:
- Tiêu đề: 📰 <b>[BẢN TIN THỜI SỰ TIÊU ĐIỂM] — VIỆT NAM & THẾ GIỚI</b>
- Phần 1: <b>🇻🇳 VIỆT NAM HÔM NAY</b>
  Chọn lọc 3 tin nổi bật nhất về kinh tế, chính sách, đời sống xã hội:
  • <b><a href="URL">Tiêu đề</a></b>: Tóm lược 1-2 câu đi thẳng vào bản chất sự kiện.
- Phần 2: <b>🌍 TOÀN CẦU & QUỐC TẾ</b>
  Chọn lọc 3 sự kiện địa chính trị, kinh tế vĩ mô đáng chú ý:
  • <b><a href="URL">Tiêu đề</a></b>: Tóm lược 1-2 câu diễn biến chính.
- Đúc kết 1 câu nhận định nhanh bối cảnh chung trong ngày.

QUY CÁCH: Dùng thẻ HTML hợp lệ (<b>, <a>, <i>, <code>). Không dùng cú pháp Markdown.`;

  return await callGemini(prompt, apiKey);
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const teleToken = process.env.TELEGRAM_BOT_TOKEN;
  const teleChatId = process.env.TELEGRAM_CHAT_ID;

  if (!geminiKey || !teleToken || !teleChatId) {
    console.error('❌ Thiếu biến môi trường bắt buộc.');
    process.exit(1);
  }

  console.log('📡 Đang thu thập dữ liệu đa nguồn (GitHub, Tech News, Thời sự)...');
  const [repos, techNews, affairs] = await Promise.all([
    fetchGitHubTrending(),
    fetchTechNews(),
    fetchCurrentAffairs()
  ]);

  console.log(`Đã cào: ${repos.length} repos, ${techNews.vn.length + techNews.global.length} tin tech, ${affairs.vn.length + affairs.world.length} tin thời sự.`);

  // 1. Xử lý & Gửi Bản Tin 1: Tech & GitHub Radar
  console.log('\n🧠 [1/2] Đang tạo Form 1: Tech & GitHub Radar...');
  const techDigest = await buildTechDigest(repos, techNews, geminiKey);
  console.log('📨 Đang gửi Thông báo 1 qua Telegram...');
  await sendTelegram(teleToken, teleChatId, techDigest);
  console.log('✅ Đã gửi Thông báo 1 thành công!');

  // Nghỉ 2 giây giữa 2 thông báo để không bị gộp và không vượt rate limit
  await new Promise(r => setTimeout(r, 2000));

  // 2. Xử lý & Gửi Bản Tin 2: Thời Sự Việt Nam & Thế Giới
  console.log('\n🧠 [2/2] Đang tạo Form 2: Thời Sự Tiêu Điểm...');
  const newsDigest = await buildNewsDigest(affairs, geminiKey);
  console.log('📨 Đang gửi Thông báo 2 qua Telegram...');
  await sendTelegram(teleToken, teleChatId, newsDigest);
  console.log('✅ Đã gửi Thông báo 2 thành công!');

  console.log('\n🎉 Hoàn thành toàn bộ chu trình 2 bản tin sáng!');
}

main().catch(err => {
  console.error('❌ Lỗi toàn cục:', err);
  process.exit(1);
});
