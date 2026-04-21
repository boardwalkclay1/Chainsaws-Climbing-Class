export default {
  async fetch(req, env) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM classes ORDER BY date ASC"
    ).all();

    return Response.json(results);
  }
};
