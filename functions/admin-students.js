export default {
  async fetch(req, env) {
    const { results } = await env.DB.prepare(
      "SELECT id, name, email FROM students ORDER BY created_at DESC"
    ).all();

    return Response.json(results);
  }
};
