export default {
  async fetch(req, env) {
    const { results } = await env.DB.prepare(`
      SELECT r.*, s.name, s.email, c.city, 
      (c.date || ' ' || c.time) AS classLabel
      FROM reservations r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN classes c ON r.class_id = c.id
      ORDER BY r.created_at DESC
    `).all();

    return Response.json(results);
  }
};
