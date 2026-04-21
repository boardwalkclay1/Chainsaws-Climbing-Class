export default {
  async fetch(req, env) {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const tok = await env.DB.prepare(
      "SELECT student_id FROM tokens WHERE id = ?"
    ).bind(token).first();

    if (!tok) return new Response("Unauthorized", { status: 401 });

    const student = await env.DB.prepare(
      "SELECT * FROM students WHERE id = ?"
    ).bind(tok.student_id).first();

    const lessons = await env.DB.prepare(
      "SELECT * FROM lessons"
    ).all();

    const progress = await env.DB.prepare(
      "SELECT * FROM progress WHERE student_id = ?"
    ).bind(student.id).all();

    const classes = await env.DB.prepare(
      "SELECT * FROM classes WHERE city = ?"
    ).bind(student.city).all();

    const videosCompleted = progress.results.length;

    return Response.json({
      name: student.name,
      city: student.city,
      videosCompleted,
      lessons: lessons.results,
      progress: progress.results,
      classes: classes.results
    });
  }
};
