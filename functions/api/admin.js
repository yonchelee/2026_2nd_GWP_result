// POST /api/admin — 등록 자료 관리 (관리자 전용: 인증/수정/삭제)
import { json, badRequest, unauthorized, parseActivity, isValidUrl } from "./_utils.js";

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

  const action = body.action;

  // 비밀번호 확인용
  if (action === "verify") {
    return json({ ok: true });
  }

  // 등록 수정
  if (action === "update") {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return badRequest("잘못된 id 입니다.");

    const activity = parseActivity(body.activity);
    if (!activity) return badRequest("활동을 선택해 주세요. (1, 2, 3 중 하나)");

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return badRequest("이름을 입력해 주세요.");
    if (name.length > 50) return badRequest("이름은 50자 이하로 입력해 주세요.");

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!isValidUrl(url)) return badRequest("올바른 웹주소(http:// 또는 https://)를 입력해 주세요.");

    const res = await env.DB.prepare(
      "UPDATE registrations SET activity = ?, name = ?, url = ? WHERE id = ?"
    )
      .bind(activity, name, url, id)
      .run();
    if ((res.meta?.changes ?? 0) === 0) return badRequest("해당 등록을 찾을 수 없습니다.");

    return json({ ok: true, registration: { id, activity, name, url } });
  }

  // 등록 삭제 (관련 당첨 기록도 함께 제거)
  if (action === "delete") {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return badRequest("잘못된 id 입니다.");

    await env.DB.batch([
      env.DB.prepare("DELETE FROM winners WHERE registration_id = ?").bind(id),
      env.DB.prepare("DELETE FROM registrations WHERE id = ?").bind(id),
    ]);
    return json({ ok: true });
  }

  // 추첨/당첨 기록만 초기화 (등록 자료는 유지)
  if (action === "reset-draws") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM winners"),
      env.DB.prepare("DELETE FROM draws"),
      env.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('draws','winners')"),
    ]);
    return json({ ok: true });
  }

  // 전체 초기화 (등록 + 추첨 + 당첨 모두 삭제)
  if (action === "reset-all") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM winners"),
      env.DB.prepare("DELETE FROM draws"),
      env.DB.prepare("DELETE FROM registrations"),
      env.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('registrations','draws','winners')"),
    ]);
    return json({ ok: true });
  }

  return badRequest("알 수 없는 action 입니다.");
}
