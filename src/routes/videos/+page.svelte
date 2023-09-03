<script>
  import { onMount } from "svelte";
  import axios from "axios";

  let videos = [];

  onMount(async () => {
    try {
      const response = await axios.get("https://v3.sdrive.app/hlsvideos");
      if (response.status === 200) {
        videos = response.data.message;
      }
    } catch (error) {
      console.error("An error occurred while fetching videos:", error);
    }
  });
</script>

<div class="main">
  <h1>SDrive video HLS upload microservice</h1>
  <h2>Videos</h2>

  {#if videos.length > 0}
    <ul class="list">
      {#each videos as video}
        <li>
          <a href={`/videos/${video.id}`}>
            {video.created_at}
            <br /><img
              class="thumbnail"
              src={video.playlist.replace(".m3u8", "_anim.gif")}
              alt="Video thumbnail"
            />
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No videos available.</p>
  {/if}
</div>

<style>
  .thumbnail {
    width: 180px;
    height: 180px;
    object-fit: cover;
  }
  .list {
    list-style-type: none;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }
</style>
