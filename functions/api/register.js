// POST /api/register — 활동 결과물 등록
import { json, badRequest, parseActivity, isValidUrl } from "./_utils.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("잘못된 요청 형식입니다.");
  }

  const activity = parseActivity(body.activity);
  if (!activity) return badRequest("활동을 선택해 주세요.");

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return badRequest("이름을 입력해 주세요.");
  if (name.length > 50) return badRequest("이름은 50자 이하로 입력해 주세요.");

  // 활동 1~3: 웹주소 / 활동 4(소감): 텍스트 — 모두 url 컬럼에 저장
  const value = typeof body.url === "string" ? body.url.trim() : "";
  if (activity === 4) {
    if (!value) return badRequest("소감을 입력해 주세요.");
    if (value.length > 1000) return badRequest("소감은 1000자 이하로 입력해 주세요.");
  } else {
    if (!isValidUrl(value)) {
      return badRequest("올바른 웹주소(http:// 또는 https://)를 입력해 주세요.");
    }
  }

  const result = await env.DB.prepare(
    "INSERT INTO registrations (activity, name, url) VALUES (?, ?, ?)"
  )
    .bind(activity, name, value)
    .run();

  return json({
    ok: true,
    id: result.meta?.last_row_id ?? null,
    registration: { activity, name, url: value },
  });
}
