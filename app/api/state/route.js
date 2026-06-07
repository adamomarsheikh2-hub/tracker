import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/state
// Returns { needsSetup: true } if no data exists (first load or after reset).
// Returns { logs, lastGhkSide, needsSetup: false } otherwise.
export async function GET() {
  const { rows } = await query(
    `SELECT data FROM tracker_state_v2 WHERE id = 1`
  );

  const data = rows[0]?.data;

  // No row, or reset was called (lastGhkSide set to null) → show setup screen
  if (!data || !data.lastGhkSide) {
    return Response.json({ needsSetup: true });
  }

  return Response.json({
    logs: data.logs || {},
    lastGhkSide: data.lastGhkSide,
    needsSetup: false,
  });
}

// PUT /api/state  body: { logs, lastGhkSide }
// lastGhkSide = null signals "reset" — next GET will return needsSetup: true.
export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const data = {
    logs: body?.logs ?? {},
    lastGhkSide: body?.lastGhkSide ?? null,
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
