# KOL Accelerator

Build a full Vietnamese affiliate training platform called "KOL AI SYSTEM" — a gamified 30-day income growth challenge app. Use React + TypeScript + Tailwind CSS + Supabase.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 DESIGN SYSTEM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Dark theme throughout

- Background: #0A0A0F

- Card surface: #12121A

- Border: #1E1E2E

- Primary accent: #7C3AED (purple)

- Gold accent: #F59E0B

- Success green: #10B981

- Font: Inter

- Rounded corners: 12–16px

- Smooth transitions: 200ms ease

- Mobile-first, fully responsive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 PAGE 1 — LOGIN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Full-screen dark gradient background (#0A0A0F → #1A0A2E)

- Centered card with:

  • App logo: a glowing purple AI brain icon

  • App name: "KOL AI SYSTEM" in bold white, large

  • Tagline: "Hệ thống huấn luyện dòng tiền 30 ngày"

  • Subtitle: "Dành cho KOL & Affiliate Việt Nam"

- "Đăng nhập bằng Google" button — white, rounded, Google icon

- Supabase Google OAuth on click

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 PAGE 2 — DASHBOARD (Home)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top bar:

  - Left: KOL AI SYSTEM logo (small) + app name

  - Right: avatar + name + current income badge (e.g. "$50 — Đang tăng tốc") + day counter "Ngày 12/30"

4 metric cards in a grid:

  🔥 Streak: consecutive days active

  ⚡ Điểm hôm nay: points earned today

  ✅ Nhiệm vụ: completed/total (e.g. 3/5)

  💰 Mốc hiện tại: current income milestone

Progress bar: % toward next income milestone, labeled with current and next amounts

Today's Phase Banner:

  Day 1–7   → "Pha 1 — Khởi động & xây nền" (green)

  Day 8–15  → "Pha 2 — Tăng tốc & chốt đơn" (amber)

  Day 16–23 → "Pha 3 — Nhân rộng & tối ưu" (purple)

  Day 24–30 → "Pha 4 — Bứt phá $1,000" (coral/red)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PAGE 3 — DAILY MISSIONS (Nhiệm vụ hôm nay)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Show 5 mission cards per day. Each card:

  - Icon + mission name + short description

  - Points badge (right side)

  - Checkbox: when checked → card turns green, checkmark animation, confetti burst

  - Input field: log quantity (e.g. "Đã mời X người")

PHASE 1 (Day 1–7):

  1. 🔗 Mời thành viên Zalo — "Mời 3 người vào nhóm Zalo hôm nay" — quota: 3 người — +20 pts [PRIORITY #1]

  2. 💬 Nhắn tin chủ động — "Nhắn tin cho 5 người, chia sẻ giá trị" — quota: 5 người — +15 pts [PRIORITY #2]

  3. ✍️ Đăng bài content — "1 bài trên mạng xã hội" — quota: 1 bài — +10 pts

  4. 🎬 Xem video học — "Xem 1 bài học, ghi 1 điểm áp dụng" — quota: 1 video — +10 pts

  5. 📝 Xây trang bán hàng — "Viết nháp: tôi là ai, bán gì, ai cần mua" — quota: 1 lần — +15 pts [PRIORITY #3]

PHASE 2 (Day 8–15):

  1. 🔗 Mời thành viên Zalo — "Mời 7 người — dùng story + bài đăng" — quota: 7 người — +25 pts [PRIORITY #1]

  2. 💰 Chốt đơn bán hàng — "Nhắn tin 10 người, chốt ít nhất 1 đơn" — quota: 10 người — +40 pts [PRIORITY #2]

  3. 🌐 Ra mắt trang bán hàng — "Đăng link trang lên Zalo, Facebook, bio" — quota: 1 link — +30 pts [PRIORITY #3]

  4. ✍️ Content bằng chứng thật — "1–2 bài kết quả thật, câu chuyện thật" — quota: 2 bài — +20 pts

  5. 📞 Gọi kết nối đồng đội — "Gọi 1 người học script bán hàng" — quota: 1 cuộc — +15 pts

PHASE 3 (Day 16–23):

  1. 🔗 Tăng trưởng Zalo — "Mời 15 người — kết hợp referral từ thành viên cũ" — quota: 15 người — +30 pts [PRIORITY #1]

  2. 💰 Bán hàng có hệ thống — "Liên hệ 15 người, chốt 2–3 đơn" — quota: 15 người — +50 pts [PRIORITY #2]

  3. 🌐 Nâng cấp trang bán hàng — "Thêm testimonial, FAQ, CTA rõ ràng" — quota: 1 lần — +35 pts [PRIORITY #3]

  4. ✍️ Content chứng minh kết quả — "2 bài: màn hình thu nhập, phản hồi khách" — quota: 2 bài — +25 pts

  5. 👥 Xây team mini — "Đào tạo 1 người cùng bán, phân chia hoa hồng" — quota: 1 người — +40 pts

PHASE 4 (Day 24–30):

  1. 🔗 Viral mời Zalo — "Mời 25+ người — live stream, challenge cộng đồng" — quota: 25 người — +40 pts [PRIORITY #1]

  2. 💰 Sprint bán hàng toàn lực — "Tiếp cận 25 người, flash sale, deadline cuối tháng" — quota: 25 người — +60 pts [PRIORITY #2]

  3. 🌐 Hoàn thiện trang bán hàng — "Thêm timer đếm ngược, video testimonial, upsell" — quota: 1 lần — +40 pts [PRIORITY #3]

  4. ✍️ Content bứt phá 3 lần/ngày — "Sáng/trưa/tối — hành trình tiến đến $1,000" — quota: 3 bài — +30 pts

  5. 🏆 Huy động cả nhóm — "Tổ chức mini contest trong Zalo — ai mời nhiều nhất" — quota: 1 contest — +50 pts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PAGE 4 — KHUNG NĂNG LỰC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 main stat cards:

  - Bộ đếm nhiệm vụ: circular progress ring, tasks this week vs target (purple)

  - Ngọn lửa streak: animated fire icon, days streak count (amber/gold)

  - Điểm năng lực: total points + level:

      0–199 → "Người mới bắt đầu"

      200–499 → "Đang phát triển"

      500–999 → "Chuyên nghiệp"

      1000+ → "Bậc thầy KOL"

Weekly bar chart: points earned per day (7 bars)

Skill badges:

  🔗 "Người kết nối" — mời 50+ thành viên Zalo tổng cộng

  💰 "Người bán hàng" — chốt 10+ đơn tổng cộng

  🌐 "Người xây trang" — hoàn thiện trang bán hàng

  🔥 "Người kiên trì" — streak 7 ngày liên tiếp

  ⭐ "KOL nổi bật" — top 3 bảng xếp hạng

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PAGE 5 — CẤP ĐỘ DÒNG TIỀN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13 income milestones — vertical list:

  $1     → "Tia sáng đầu tiên"    — Bronze

  $5     → "Bước đi vững chắc"   — Bronze

  $10    → "Đang lên đà"          — Silver

  $20    → "Tăng tốc"             — Silver

  $50    → "Chiến binh dòng tiền" — Gold

  $100   → "KOL thực chiến"       — Gold

  $150   → "Đang bứt phá"         — Gold

  $200   → "Tay nghề cao"         — Platinum

  $400   → "KOL chuyên nghiệp"    — Platinum

  $500   → "Nửa đường đỉnh cao"   — Diamond

  $650   → "Sắp chinh phục"       — Diamond

  $880   → "Gần đỉnh rồi"         — Diamond

  $1,000 → "KOL AI MASTER"        — LEGEND (gold glow border, animated)

Each row: amount + title + rank badge + lock/check icon

"Đánh dấu đạt được" button on the next unlocked milestone only

When tapped:

  → Full-screen trophy overlay: large golden trophy + sparkle animation, 3 seconds

  → Modal "Tổng kết thành công tuần này":

      - Nhiệm vụ hoàn thành tuần này

      - Điểm tích lũy tuần này

      - Streak hiện tại

      - Message: "Chúc mừng! Bạn đã đạt mốc [X]! Tiếp tục chinh phục thử thách tiếp theo!"

      - "Chia sẻ thành tích" button — copies text to clipboard

      - "Tiếp tục" button to close

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 PAGE 6 — HUẤN LUYỆN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 tabs: "Video học" | "Tài liệu & Script" | "Lịch Live"

Video tab: grid — thumbnail, title, duration, phase tag, "Đã xem" badge if watched. Clicking marks as watched and awards +10 pts.

Tài liệu tab:

  - Script mời thành viên Zalo

  - Script nhắn tin bán hàng

  - Template bài content viral

  - Checklist xây trang bán hàng

Lịch Live tab: date + time + topic + "Tham gia" / "Xem lại" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 PAGE 7 — VINH DANH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 tabs: Tuần này | Tháng này | Toàn thời gian

Top 3 podium: large avatars, names, points, crown on #1

Full ranked list: rank + avatar + name + income badge + total points

Current user row highlighted in purple

"Chia sẻ xếp hạng" button copies rank text to clipboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧭 NAVIGATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mobile: fixed bottom nav, 5 icons:

  🏠 Trang chủ | 📋 Nhiệm vụ | 📊 Năng lực | 💰 Dòng tiền | 🎓 Học

Desktop: left sidebar — KOL AI SYSTEM logo at top + same 5 items + user avatar at bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗄️ SUPABASE DATA MODEL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tables:

  users: id, name, avatar_url, created_at, day_number, streak, total_points, current_milestone

  daily_missions: id, user_id, date, mission_key, completed, quantity_logged, points_awarded

  income_milestones: id, user_id, milestone_amount, achieved_at

  badges: id, user_id, badge_key, earned_at

Rules:

  - Auto-detect phase from day_number

  - Reset daily missions at midnight UTC+7

  - Streak increments if at least 1 mission completed per day; resets to 0 if missed

  - Points accumulate globally, never reset

  - Leaderboard queries: weekly / monthly / all-time by total_points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ BUILD RULES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- All UI text in Vietnamese

- Use realistic mock/seed data for initial display

- Build order: Login → Dashboard → Daily Missions → Income Levels → the rest

- Loading skeletons while data fetches

- Toast notifications for all actions

- PWA-ready: manifest.json + service worker for mobile install

- App name "KOL AI SYSTEM" must appear on: login screen, top bar, browser tab title, PWA icon label

Yêu cầu giao diện dễ dùng
Lưu được dữ liệu người dùng, tên thành viên, hình ảnh thành viên có thể được tự cập nhật hình ảnh

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://buildingkolaisystem.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a632b94-7f23-4ec1-ade2-81c797150b2e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
