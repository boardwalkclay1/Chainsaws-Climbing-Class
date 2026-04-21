export default {
  async fetch(req, env) {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const tok = await env.DB.prepare(
      "SELECT student_id FROM tokens WHERE id = ?"
    ).bind(token).first();

    if (!tok) return new Response("Unauthorized", { status: 401 });

    const { lessonId } = await req.json();

    await env.DB.prepare(
      "INSERT INTO progress (id, student_id, lesson_id) VALUES (?, ?, ?)"
    ).bind(crypto.randomUUID(), tok.student_id, lessonId).run();

    return Response.json({ success: true });
  }
};
