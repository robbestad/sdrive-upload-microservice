import * as api from "$lib/api.js";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params }) {
  const [video] = await Promise.all([api.get(`/upload/video?id=${params.slug}`)]);
  console.log(video)  
  return video.message;
}
