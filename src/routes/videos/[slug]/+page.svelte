<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>{data.id}</title>
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
