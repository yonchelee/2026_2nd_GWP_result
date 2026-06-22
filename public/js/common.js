// 공통 프론트엔드 헬퍼

export const ACTIVITIES = {
  1: { label: "AI로 파이썬 프로그램 개발하기", emoji: "🐍", color: "indigo" },
  2: { label: "웹페이지 개발해서 GitHub 등록하기", emoji: "🌐", color: "emerald" },
  3: { label: "AI로 어시스턴트 만들기", emoji: "🤖", color: "rose" },
};

export async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok || (data && data.ok === false)) {
    const msg = (data && data.error) || `요청 실패 (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export function escapeHtml(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// 상단 네비게이션을 페이지마다 동일하게 주입
export function renderNav(active) {
  const items = [
    { href: "/", label: "홈" },
    { href: "/register.html", label: "결과 등록" },
    { href: "/participants.html", label: "등록 현황" },
    { href: "/winners.html", label: "당첨 결과" },
  ];
  const links = items
    .map((it) => {
      const isActive = it.href === active;
      const cls = isActive
        ? "text-white font-semibold"
        : "text-indigo-200 hover:text-white";
      return `<a href="${it.href}" class="${cls} transition">${it.label}</a>`;
    })
    .join("");
  return `
  <header class="bg-indigo-700/90 backdrop-blur sticky top-0 z-20 shadow-lg">
    <nav class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="text-white font-bold text-lg flex items-center gap-2">
        <span>🚀</span><span>AI 첫발, 함께 내딛다</span>
      </a>
      <div class="flex gap-5 text-sm">${links}</div>
    </nav>
  </header>`;
}
