export default {
  async fetch(req, env) {
    if (req.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM cities").all();
      return Response.json(results);
    }

    if (req.method === "POST") {
      const { name } = await req.json();
      await env.DB.prepare(
        "INSERT INTO cities (id, name) VALUES (?, ?)"
      ).bind(crypto.randomUUID(), name).run();

      return Response.json({ success: true });
    }
  }
};
