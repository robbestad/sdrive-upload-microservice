<script>
  /** @type {import('./$types').PageData} */
  export let data;
  let url = `https://sdrive.app/videos/${data.id}`;
  let { id, created_at, base, anim, screenshots } = data;
  let description = `SDrive video ${id}. Created at ${created_at}`;
  let title = `SDrive video ${id}`;
  let filesrc = data.playlist;
  let ogType = "video.other";
  let ogVideoTag = "viral";
  let ogVideoType = "video/mp4";
  let image  = `${base}/${screenshots[3]}`;

</script>

<svelte:head>
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:creator" content="@sdrive_app" />
  <link rel="notImportant" href={url} />
  <link rel="canonical" href={url} />
  <meta content="#43B581" name="theme-color" />
  <meta name="twitter:site" content="@sdrive_app" />
  <meta name="twitter:image:src" content={image} />
  <meta property="og:image" content={image} />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={ogType} />
  <meta property="og:site_name" content="Sdrive.app" />
  <meta name="og:video:url" content={filesrc} />
  <meta property="og:image:width" content="480" />
  <meta property="og:image:height" content="360" />
  <meta property="og:video:type" content={ogVideoType} />
  <meta property="og:video:tag" content={ogVideoTag} />
  <meta property="og:video:width" content="1280" />
  <meta property="og:video:height" content="720" />
  <meta name="twitter:player" content={url} />
  <meta name="twitter:player:height" content="720" />
  <meta name="twitter:player:width" content="1280" />
  <meta name="twitter:player:stream" content={filesrc} />
  <meta name="og:video:secure_url" content={filesrc} />
  <meta name="twitter:card" content="player" />
  <meta
    name="twitter:player:stream"
    content="https://sdrive-upload-microservice.vercel.app/video/{id}"
  />
</svelte:head>

<div class="main">
  <h1>{data.id}</h1>
  {#if data.playlist}
    <mux-video src={data.playlist} class="video" controls />
  {/if}
</div>

<style>
  .main {
    padding: 1rem;
  }
  .video {
    width: 100%;
    height: 50vh;
  }
</style>
