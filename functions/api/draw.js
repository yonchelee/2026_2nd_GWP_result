// POST /api/draw — 관리자 추첨 (비밀번호 검증 + 무작위 추출 + 저장)
import { json, badRequest, unauthorized, secureShuffle } from "./_utils.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("잘못된 요청 형식입니다.");
  }

  // 관리자 비밀번호 검증 (서버 측에서만)
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "서버에 ADMIN_PASSWORD가 설정되지 않았습니다." }, 500);
  }
  if (body.password !== env.ADMIN_PASSWORD) {
    return unauthorized("관리자 비밀번호가 일치하지 않습니다.");
  }

  // 추첨 범위: 'all' | '1' | '2' | '3'
  const scope = String(body.scope ?? "all");
  if (!["all", "1", "2", "3"].includes(scope)) {
    return badRequest("추첨 범위가 올바르지 않습니다.");
  }

  const count = Number(body.count);
  if (!Number.isInteger(count) || count < 1) {
    return badRequest("당첨 인원은 1명 이상의 정수여야 합니다.");
  }

  const prize = typeof body.prize === "string" ? body.prize.trim() : "";

  // 대상 등록자 풀 조회 — 이미 당첨된 사람(추첨함에서 빠진 공)은 제외
  let pool;
  if (scope === "all") {
    pool = await env.DB.prepare(
      "SELECT id, name, activity FROM registrations WHERE id NOT IN (SELECT registration_id FROM winners)"
    ).all();
  } else {
    pool = await env.DB.prepare(
      "SELECT id, name, activity FROM registrations WHERE activity = ? AND id NOT IN (SELECT registration_id FROM winners)"
    )
      .bind(Number(scope))
      .all();
  }

  const candidates = pool.results ?? [];
  if (candidates.length === 0) {
    return badRequest("해당 범위에 추첨할 남은 등록자가 없습니다.");
  }

  const picked = secureShuffle(candidates).slice(0, Math.min(count, candidates.length));

  // 추첨 기록 저장
  const drawInsert = await env.DB.prepare(
    "INSERT INTO draws (scope, prize) VALUES (?, ?)"
  )
    .bind(scope, prize || null)
    .run();
  const drawId = drawInsert.meta?.last_row_id;

  const stmt = env.DB.prepare(
    "INSERT INTO winners (draw_id, registration_id, name, activity) VALUES (?, ?, ?, ?)"
  );
  await env.DB.batch(
    picked.map((w) => stmt.bind(drawId, w.id, w.name, w.activity))
  );

  return json({
    ok: true,
    draw: { id: drawId, scope, prize: prize || null, total_candidates: candidates.length },
    winners: picked,
  });
}
