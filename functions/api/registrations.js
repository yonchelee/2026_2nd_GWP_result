// GET /api/registrations?activity=N — 등록 목록 조회 (activity 없으면 전체)
import { json, parseActivity } from "./_utils.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const activityParam = url.searchParams.get("activity");

  let rows;
  if (activityParam) {
    const activity = parseActivity(activityParam);
    if (!activity) return json({ ok: false, error: "잘못된 활동 값입니다." }, 400);
    rows = await env.DB.prepare(
      "SELECT id, activity, name, url, created_at FROM registrations WHERE activity = ? ORDER BY created_at DESC"
    )
      .bind(activity)
      .all();
  } else {
    rows = await env.DB.prepare(
      "SELECT id, activity, name, url, created_at FROM registrations ORDER BY activity ASC, created_at DESC"
    ).all();
  }

  return json({ ok: true, registrations: rows.results ?? [] });
}
