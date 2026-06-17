export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route: POST /api/class-signup
    if (url.pathname === "/api/class-signup" && request.method === "POST") {
      return handleClassSignup(request, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

// ===============================
// CLASS SIGNUP HANDLER
// ===============================
async function handleClassSignup(request, env) {
  try {
    const body = await request.json();

    const { classId, name, email, type } = body;

    if (!classId || !name || !email || !type) {
      return json({ error: "Missing required fields." }, 400);
    }

    // Insert into D1
    await env.DB.prepare(
      `INSERT INTO class_signups (class_id, name, email, type, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    )
      .bind(classId, name, email, type)
      .run();

    return json({
      success: true,
      message: "Your spot is reserved! Check your email for confirmation."
    });
  } catch (err) {
    return json({ error: "Server error", details: err.message }, 500);
  }
}

// ===============================
// JSON HELPER
// ===============================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
