export default {
  async fetch(req, env) {
    if (req.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM lessons").all();
      return Response.json(results);
    }

    if (req.method === "POST") {
      const form = await req.formData();
      const id = crypto.randomUUID();

      const title = form.get("title");
      const description = form.get("description");
      const video = form.get("video");

      let videoUrl = "";

      if (video && typeof video === "object") {
        const key = `videos/${id}.mp4`;
        await env.R2.put(key, await video.arrayBuffer());
        videoUrl = key;
      }

      await env.DB.prepare(
        "INSERT INTO lessons (id, title, description, video_url) VALUES (?, ?, ?, ?)"
      ).bind(id, title, description, videoUrl).run();

      return Response.json({ success: true });
    }
  }
};
