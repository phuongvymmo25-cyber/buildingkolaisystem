export type Phase = 1 | 2 | 3 | 4;

export interface MissionDef {
  key: string;
  icon: string;
  name: string;
  description: string;
  quota: number;
  unit: string;
  points: number;
  priority?: number;
}

export interface PhaseInfo {
  phase: Phase;
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const PHASE_INFO: Record<Phase, PhaseInfo> = {
  1: {
    phase: 1,
    name: "Pha 1 — Khởi động & xây nền",
    color: "phase-1",
    bgClass: "bg-[var(--phase-1)]/15",
    textClass: "text-[var(--phase-1)]",
    borderClass: "border-[var(--phase-1)]/40",
  },
  2: {
    phase: 2,
    name: "Pha 2 — Tăng tốc & chốt đơn",
    color: "phase-2",
    bgClass: "bg-[var(--phase-2)]/15",
    textClass: "text-[var(--phase-2)]",
    borderClass: "border-[var(--phase-2)]/40",
  },
  3: {
    phase: 3,
    name: "Pha 3 — Nhân rộng & tối ưu",
    color: "phase-3",
    bgClass: "bg-[var(--phase-3)]/15",
    textClass: "text-[var(--phase-3)]",
    borderClass: "border-[var(--phase-3)]/40",
  },
  4: {
    phase: 4,
    name: "Pha 4 — Bứt phá $1,000",
    color: "phase-4",
    bgClass: "bg-[var(--phase-4)]/15",
    textClass: "text-[var(--phase-4)]",
    borderClass: "border-[var(--phase-4)]/40",
  },
};

export function getPhaseFromDay(day: number): Phase {
  if (day <= 7) return 1;
  if (day <= 15) return 2;
  if (day <= 23) return 3;
  return 4;
}

// Trang bán hàng + quà tặng — độ khó tăng dần theo ngày, gắn với nhiệm vụ
export function getSalesPageMission(day: number): MissionDef {
  const phase = getPhaseFromDay(day);
  if (phase === 1) {
    return {
      key: `d${day}_sales`,
      icon: "🌐",
      name: `Trang bán hàng + Quà tặng — Ngày ${day}`,
      description: "Viết nháp: tôi là ai, bán gì, ai cần mua. Tặng kèm 1 ebook/checklist mini liên quan tới nhóm Zalo bạn vừa mời.",
      quota: 1,
      unit: "phần",
      points: 15,
      priority: 3,
    };
  }
  if (phase === 2) {
    return {
      key: `d${day}_sales`,
      icon: "🌐",
      name: `Trang bán hàng + Quà tặng — Ngày ${day}`,
      description: "Hoàn thiện headline + CTA + 1 quà tặng số (template/script) cho khách đăng ký từ nhóm Zalo của bạn.",
      quota: 1,
      unit: "phần",
      points: 25,
      priority: 3,
    };
  }
  if (phase === 3) {
    return {
      key: `d${day}_sales`,
      icon: "🌐",
      name: `Trang bán hàng + Quà tặng — Ngày ${day}`,
      description: "Thêm testimonial + FAQ + combo quà tặng (mini-course) gắn với chủ đề bạn đang chốt đơn hôm nay.",
      quota: 1,
      unit: "phần",
      points: 35,
      priority: 3,
    };
  }
  return {
    key: `d${day}_sales`,
    icon: "🌐",
    name: `Trang bán hàng + Quà tặng — Ngày ${day}`,
    description: "Timer đếm ngược, video testimonial, upsell + bộ quà tặng VIP (bundle) đồng bộ với sprint flash sale.",
    quota: 1,
    unit: "phần",
    points: 45,
    priority: 3,
  };
}

// Sản xuất video POV — mỗi ngày tự quay video POV về việc bạn đang làm
export function getPOVVideoMission(day: number): MissionDef {
  const phase = getPhaseFromDay(day);
  const points = phase === 1 ? 15 : phase === 2 ? 20 : phase === 3 ? 25 : 30;
  return {
    key: `d${day}_pov`,
    icon: "🎥",
    name: `Sản xuất video POV — Ngày ${day}`,
    description: "Quay 1 video POV (góc nhìn thứ nhất) về những gì bạn đang làm hôm nay để đạt kết quả: mời nhóm, chốt đơn, xây trang. Đăng lên TikTok/Reels/Story.",
    quota: 1,
    unit: "video",
    points,
  };
}

export const MISSIONS_BY_PHASE: Record<Phase, MissionDef[]> = {
  1: [
    { key: "p1_invite", icon: "🔗", name: "Mời thành viên Zalo", description: "Mời 3 người vào nhóm Zalo hôm nay", quota: 3, unit: "người", points: 20, priority: 1 },
    { key: "p1_message", icon: "💬", name: "Nhắn tin chủ động", description: "Nhắn tin cho 5 người, chia sẻ giá trị", quota: 5, unit: "người", points: 15, priority: 2 },
    { key: "p1_content", icon: "✍️", name: "Đăng bài content", description: "1 bài trên mạng xã hội", quota: 1, unit: "bài", points: 10 },
  ],
  2: [
    { key: "p2_invite", icon: "🔗", name: "Mời thành viên Zalo", description: "Mời 7 người — dùng story + bài đăng", quota: 7, unit: "người", points: 25, priority: 1 },
    { key: "p2_close", icon: "💰", name: "Chốt đơn bán hàng", description: "Nhắn tin 10 người, chốt ít nhất 1 đơn", quota: 10, unit: "người", points: 40, priority: 2 },
    { key: "p2_content", icon: "✍️", name: "Content bằng chứng thật", description: "1–2 bài kết quả thật, câu chuyện thật", quota: 2, unit: "bài", points: 20 },
    { key: "p2_call", icon: "📞", name: "Gọi kết nối đồng đội", description: "Gọi 1 người học script bán hàng", quota: 1, unit: "cuộc", points: 15 },
  ],
  3: [
    { key: "p3_invite", icon: "🔗", name: "Tăng trưởng Zalo", description: "Mời 15 người — kết hợp referral từ thành viên cũ", quota: 15, unit: "người", points: 30, priority: 1 },
    { key: "p3_sales", icon: "💰", name: "Bán hàng có hệ thống", description: "Liên hệ 15 người, chốt 2–3 đơn", quota: 15, unit: "người", points: 50, priority: 2 },
    { key: "p3_proof", icon: "✍️", name: "Content chứng minh kết quả", description: "2 bài: màn hình thu nhập, phản hồi khách", quota: 2, unit: "bài", points: 25 },
    { key: "p3_team", icon: "👥", name: "Xây team mini", description: "Đào tạo 1 người cùng bán, phân chia hoa hồng", quota: 1, unit: "người", points: 40 },
  ],
  4: [
    { key: "p4_viral", icon: "🔗", name: "Viral mời Zalo", description: "Mời 25+ người — live stream, challenge cộng đồng", quota: 25, unit: "người", points: 40, priority: 1 },
    { key: "p4_sprint", icon: "💰", name: "Sprint bán hàng toàn lực", description: "Tiếp cận 25 người, flash sale, deadline cuối tháng", quota: 25, unit: "người", points: 60, priority: 2 },
    { key: "p4_content", icon: "✍️", name: "Content bứt phá 3 lần/ngày", description: "Sáng/trưa/tối — hành trình tiến đến $1,000", quota: 3, unit: "bài", points: 30 },
    { key: "p4_contest", icon: "🏆", name: "Huy động cả nhóm", description: "Tổ chức mini contest trong Zalo — ai mời nhiều nhất", quota: 1, unit: "contest", points: 50 },
  ],
};

export function getTodayMissions(day: number): MissionDef[] {
  // Nhiệm vụ pha + Sản xuất video POV (mặc định mỗi ngày) + Trang bán hàng/quà tặng (mặc định mỗi ngày)
  return [
    ...MISSIONS_BY_PHASE[getPhaseFromDay(day)],
    getPOVVideoMission(day),
    getSalesPageMission(day),
  ];
}

export function getAllMissionsMap(): Record<string, MissionDef> {
  const map: Record<string, MissionDef> = {};
  for (const phase of [1, 2, 3, 4] as Phase[]) {
    for (const m of MISSIONS_BY_PHASE[phase]) map[m.key] = m;
  }
  for (let d = 1; d <= 30; d++) {
    const pov = getPOVVideoMission(d);
    const sales = getSalesPageMission(d);
    map[pov.key] = pov;
    map[sales.key] = sales;
  }
  return map;
}

// Income milestones
export interface MilestoneDef {
  amount: number;
  title: string;
  rank: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Legend";
}

export const MILESTONES: MilestoneDef[] = [
  { amount: 1, title: "Tia sáng đầu tiên", rank: "Bronze" },
  { amount: 5, title: "Bước đi vững chắc", rank: "Bronze" },
  { amount: 10, title: "Đang lên đà", rank: "Silver" },
  { amount: 20, title: "Tăng tốc", rank: "Silver" },
  { amount: 50, title: "Chiến binh dòng tiền", rank: "Gold" },
  { amount: 100, title: "KOL thực chiến", rank: "Gold" },
  { amount: 150, title: "Đang bứt phá", rank: "Gold" },
  { amount: 200, title: "Tay nghề cao", rank: "Platinum" },
  { amount: 400, title: "KOL chuyên nghiệp", rank: "Platinum" },
  { amount: 500, title: "Nửa đường đỉnh cao", rank: "Diamond" },
  { amount: 650, title: "Sắp chinh phục", rank: "Diamond" },
  { amount: 880, title: "Gần đỉnh rồi", rank: "Diamond" },
  { amount: 1000, title: "KOL AI MASTER", rank: "Legend" },
  { amount: 1250, title: "Huyền Thoại", rank: "Legend" },
  { amount: 1500, title: "Doanh Chủ", rank: "Legend" },
  { amount: 2000, title: "Builder Good", rank: "Legend" },
];

export const RANK_COLORS: Record<MilestoneDef["rank"], string> = {
  Bronze: "from-amber-700 to-amber-900 text-amber-100",
  Silver: "from-slate-400 to-slate-600 text-slate-50",
  Gold: "from-yellow-400 to-amber-600 text-amber-950",
  Platinum: "from-cyan-300 to-blue-500 text-blue-950",
  Diamond: "from-fuchsia-400 to-purple-600 text-white",
  Legend: "from-yellow-300 via-amber-500 to-orange-600 text-amber-950",
};

export function getCurrentMilestoneIndex(currentAmount: number): number {
  let idx = -1;
  for (let i = 0; i < MILESTONES.length; i++) {
    if (currentAmount >= MILESTONES[i].amount) idx = i;
  }
  return idx;
}

export function getNextMilestone(currentAmount: number): MilestoneDef | null {
  const idx = getCurrentMilestoneIndex(currentAmount);
  return MILESTONES[idx + 1] || null;
}

export function getCurrentMilestone(currentAmount: number): MilestoneDef | null {
  const idx = getCurrentMilestoneIndex(currentAmount);
  return idx >= 0 ? MILESTONES[idx] : null;
}

export function getLevelFromPoints(points: number): { name: string; min: number; next: number | null } {
  if (points < 200) return { name: "Người mới bắt đầu", min: 0, next: 200 };
  if (points < 500) return { name: "Đang phát triển", min: 200, next: 500 };
  if (points < 1000) return { name: "Chuyên nghiệp", min: 500, next: 1000 };
  return { name: "Bậc thầy KOL", min: 1000, next: null };
}

export function todayVN(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const vn = new Date(utc + 7 * 3600000);
  return vn.toISOString().slice(0, 10);
}
