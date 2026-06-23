// 테마 토글 + 스크롤 리빌 (yonchelee.com 디자인 시스템)
function toggleTheme() {
  const d = document.documentElement;
  const next = d.dataset.theme === "dark" ? "light" : "dark";
  d.dataset.theme = next;
  try { localStorage.setItem("gwp-theme", next); } catch (e) {}
}
window.toggleTheme = toggleTheme;

document.addEventListener("DOMContentLoaded", () => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".sr").forEach((el) => io.observe(el));
});
