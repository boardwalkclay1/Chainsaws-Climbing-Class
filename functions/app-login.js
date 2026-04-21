export default {
  async fetch(req, env) {
    const { email } = await req.json();

    const student = await env.DB.prepare(
      "SELECT * FROM students WHERE email = ?"
    ).bind(email).first();

    if (!student) return new Response("Not found", { status: 404 });

    const token = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO tokens (id, student_id) VALUES (?, ?)"
    ).bind(token, student.id).run().catch(() => {});

    return Response.json({ token });
  }
};
