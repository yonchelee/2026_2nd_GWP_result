// GET /api/winners — 추첨/당첨 이력 조회
import { json } from "./_utils.js";

export async function onRequestGet(context) {
  const { env } = context;

  const draws = await env.DB.prepare(
    "SELECT id, scope, prize, drawn_at FROM draws ORDER BY drawn_at DESC"
  ).all();

  const winners = await env.DB.prepare(
    "SELECT id, draw_id, registration_id, name, activity FROM winners ORDER BY id ASC"
  ).all();

  // 추첨별로 당첨자 묶기
  const byDraw = {};
  for (const w of winners.results ?? []) {
    (byDraw[w.draw_id] ??= []).push(w);
  }

  const history = (draws.results ?? []).map((d) => ({
    ...d,
    winners: byDraw[d.id] ?? [],
  }));

  return json({ ok: true, history });
}
