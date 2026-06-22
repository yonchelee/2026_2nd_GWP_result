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
  if (!activity) return badRequest("활동을 선택해 주세요. (1, 2, 3 중 하나)");

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return badRequest("이름을 입력해 주세요.");
  if (name.length > 50) return badRequest("이름은 50자 이하로 입력해 주세요.");

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!isValidUrl(url)) {
    return badRequest("올바른 웹주소(http:// 또는 https://)를 입력해 주세요.");
  }

  const result = await env.DB.prepare(
    "INSERT INTO registrations (activity, name, url) VALUES (?, ?, ?)"
  )
    .bind(activity, name, url)
    .run();

  return json({
    ok: true,
    id: result.meta?.last_row_id ?? null,
    registration: { activity, name, url },
  });
}
