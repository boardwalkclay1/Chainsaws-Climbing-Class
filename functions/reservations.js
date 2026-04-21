export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const data = await req.json();
    const id = crypto.randomUUID();

    // Create student if not exists
    const existing = await env.DB.prepare(
      "SELECT id FROM students WHERE email = ?"
    ).bind(data.email).first();

    let studentId = existing?.id;

    if (!studentId) {
      studentId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO students (id, name, email, phone, city) VALUES (?, ?, ?, ?, ?)"
      ).bind(studentId, data.name, data.email, data.phone, data.city || "").run();
    }

    // Create reservation
    await env.DB.prepare(
      "INSERT INTO reservations (id, student_id, class_id, source) VALUES (?, ?, ?, ?)"
    ).bind(id, studentId, data.classId || "", data.source || "web").run();

    return Response.json({ success: true });
  }
};
