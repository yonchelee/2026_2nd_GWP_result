// 공통 유틸 — JSON 응답 헬퍼와 입력 검증

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function badRequest(message) {
  return json({ ok: false, error: message }, 400);
}

export function unauthorized(message = "인증에 실패했습니다.") {
  return json({ ok: false, error: message }, 401);
}

// 활동 번호 검증 (1 | 2 | 3 | 4)
export function parseActivity(value) {
  const n = Number(value);
  return [1, 2, 3, 4].includes(n) ? n : null;
}

// 간단한 URL 형식 검증
export function isValidUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// crypto 기반 Fisher–Yates 셔플 (공정한 무작위 추출)
export function secureShuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const ACTIVITY_LABELS = {
  1: "AI로 파이썬 프로그램 개발하기",
  2: "웹페이지 개발해서 GitHub 등록하기",
  3: "AI로 어시스턴트 만들기",
  4: "GWP 소감",
};
