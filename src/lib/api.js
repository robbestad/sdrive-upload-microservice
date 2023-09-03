import { error } from "@sveltejs/kit";

const base = "https://v3.sdrive.app";

async function send({ method, path, data, token }) {
  const opts = { method, headers: {} };

  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }
  console.log(`${base}/${path}`);
  const res = await fetch(`${base}/${path}`, opts);
  if (res.ok || res.status === 422) {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  throw error(res.status);
}

export function get(path, id) {
  return send({ method: "GET", path, id });
}
