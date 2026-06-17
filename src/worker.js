export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ROUTES
    if (path === "/api/class-signup" && method === "POST") {
      return handleClassSignup(request, env);
    }

    if (path === "/api/lesson/complete" && method === "POST") {
      return handleLessonComplete(request, env);
    }

    if (path === "/api/user/upsert" && method === "POST") {
      return handleUserUpsert(request, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

// JSON helper
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

/* ============================================================
   USER UPSERT (create or update)
============================================================ */
async function handleUserUpsert(request, env) {
  const body = await request.json();
  const { email, name } = body;

  if (!email) return json({ error: "Email required" }, 400);

  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();

  if (existing) {
    if (name) {
      await env.DB.prepare(
        "UPDATE users SET name = ? WHERE id = ?"
      ).bind(name, existing.id).run();
    }
    return json({ success: true, userId: existing.id });
  }

  const result = await env.DB.prepare(
    `INSERT INTO users (email, name, created_at)
     VALUES (?, ?, datetime('now'))`
  ).bind(email, name || null).run();

  return json({ success: true, userId: result.lastRowId });
}

/* ============================================================
   LESSON COMPLETE → REWARD LOGIC
   Every 5 lessons = 10% reward
   Max 2 rewards per class (20%)
============================================================ */
async function handleLessonComplete(request, env) {
  const body = await request.json();
  const { email, lessonId } = body;

  if (!email || !lessonId) {
    return json({ error: "Email and lessonId required" }, 400);
  }

  // Get user
  const user = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user) return json({ error: "User not found" }, 404);

  const userId = user.id;

  // Mark lesson complete
  const existing = await env.DB.prepare(
    "SELECT id, completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?"
  ).bind(userId, lessonId).first();

  if (!existing) {
    await env.DB.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES (?, ?, 1, datetime('now'))`
    ).bind(userId, lessonId).run();
  } else if (!existing.completed) {
    await env.DB.prepare(
      `UPDATE lesson_progress
       SET completed = 1, completed_at = datetime('now')
       WHERE id = ?`
    ).bind(existing.id).run();
  }

  // Count completed lessons
  const countRes = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM lesson_progress
     WHERE user_id = ? AND completed = 1`
  ).bind(userId).first();

  const completedCount = countRes.count;

  // Award 10% every 5 lessons
  if (completedCount > 0 && completedCount % 5 === 0) {
    await env.DB.prepare(
      `INSERT INTO rewards (user_id, value, used, created_at)
       VALUES (?, 10, 0, datetime('now'))`
    ).bind(userId).run();
  }

  return json({
    success: true,
    completedCount,
    rewardGranted: completedCount % 5 === 0
  });
}

/* ============================================================
   CLASS SIGNUP → APPLY REWARDS
   Max 20% per class
   Rewards stack
   Rewards used once
============================================================ */
async function handleClassSignup(request, env) {
  const body = await request.json();
  const { classId, name, email } = body;

  if (!classId || !email) {
    return json({ error: "Missing required fields" }, 400);
  }

  // Ensure user exists
  let user = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();

  let userId;
  if (!user) {
    const newUser = await env.DB.prepare(
      `INSERT INTO users (email, name, created_at)
       VALUES (?, ?, datetime('now'))`
    ).bind(email, name || null).run();
    userId = newUser.lastRowId;
  } else {
    userId = user.id;
  }

  // Get unused rewards
  const rewards = await env.DB.prepare(
    "SELECT id FROM rewards WHERE user_id = ? AND used = 0"
  ).bind(userId).all();

  let discount = Math.min(rewards.results.length * 10, 20); // max 20%

  // Mark rewards as used
  if (discount > 0) {
    const rewardsToUse = rewards.results.slice(0, discount / 10);
    for (const r of rewardsToUse) {
      await env.DB.prepare(
        "UPDATE rewards SET used = 1 WHERE id = ?"
      ).bind(r.id).run();
    }
  }

  // Insert signup
  await env.DB.prepare(
    `INSERT INTO class_signups (user_id, class_id, discount_used, created_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).bind(userId, classId, discount).run();

  return json({
    success: true,
    discountApplied: discount,
    message: `Your spot is reserved! You saved ${discount}% on this class.`
  });
}
