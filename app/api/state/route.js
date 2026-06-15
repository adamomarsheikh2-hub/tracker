import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/state → { logs, history }
export async function GET() {
  const { rows } = await query(
    `SELECT data FROM tracker_state_v2 WHERE id = 1`
  );

  const data = rows[0]?.data;

  return Response.json({
    logs:    data?.logs    || {},
    history: data?.history || [],
  });
}

// PUT /api/state  body: { logs, history }
export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const data = {
    logs:    body?.logs    ?? {},
    history: body?.history ?? [],
  };

  await query(
    `INSERT INTO tracker_state_v2 (id, data, updated_at)
     VALUES (1, $1::jsonb, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()`,
    [JSON.stringify(data)]
  );

  return Response.json({ ok: true });
}
