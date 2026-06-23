// 공통 프론트엔드 헬퍼 (yonchelee.com 디자인 시스템)

export const ACTIVITIES = {
  1: { label: "AI로 파이썬 프로그램 개발하기", emoji: "🐍", ic: "ic-orange" },
  2: { label: "웹페이지 개발해서 GitHub 등록하기", emoji: "🌐", ic: "ic-pink" },
  3: { label: "AI로 어시스턴트 만들기", emoji: "🤖", ic: "ic-purple" },
  4: { label: "GWP 소감", emoji: "💬", ic: "ic-indigo" },
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

// 프로스티드 글라스 내비게이션 (yl-nav)
export function renderNav(active) {
  const items = [
    ["/", "홈"],
    ["/register.html", "결과 등록"],
    ["/reflection.html", "소감 등록"],
    ["/participants.html", "등록 현황"],
    ["/draw.html", "추첨"],
    ["/winners.html", "당첨 결과"],
    ["/admin.html", "관리"],
  ];
  const links = items
    .map(([href, label]) => `<a href="${href}" class="${href === active ? "on" : ""}">${label}</a>`)
    .join("");
  return `
  <nav class="yl-nav">
    <a href="/" class="logo">GWP.</a>
    ${links}
    <span class="yl-nav__spacer"></span>
    <div class="yl-nav__ctrl">
      <button class="theme-toggle" onclick="toggleTheme()" aria-label="테마 전환"><span class="tt-moon">🌙</span><span class="tt-sun">☀️</span></button>
    </div>
  </nav>`;
}
