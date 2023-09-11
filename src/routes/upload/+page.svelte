<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import {createId} from "@paralleldrive/cuid2";
  import { uploadSingleFile, reponseFromUpload } from "$lib/uploader.js";
  import { Jumper } from "svelte-loading-spinners";
  import { toasts, ToastContainer, FlatToast } from "svelte-toasts";

  const showToast = () => {
    const toast = toasts.add({
      title: "Success",
      description: "Form submitted successfully",
      duration: 3000, // 0 or negative to avoid auto-remove
      placement: "bottom-right",
      type: "info",
      theme: "dark",
      placement: "bottom-right",
      showProgress: true,
      type: "success",
      theme: "dark",
      onClick: () => {},
      onRemove: () => {}
    });
  };
  let loading = false;

  let uploadedFiles = [];
  // Subscribe to changes in the store
  const unsubscribe = reponseFromUpload.subscribe(($reponseFromUpload) => {
    uploadedFiles = $reponseFromUpload;
  });

  // Unsubscribe when the component is destroyed
  onMount(() => {
    return () => {
      unsubscribe();
    };
  });

  let intervalId;
  let progress = 0;

  let videoid = ""; //"vtg1y3y0275de1akx217gimq";
  let videoSrc = ""; //`https://shdw-drive.genesysgo.net/GYSM8Nk9kw7rYz5NbRht8Mh9K3KKRKJ86sThxVzyF4n1/${videoid}.m3u8`;

  async function checkForVideo(videoid) {
    if(!videoid) return;
    try {
      const response = await axios.get(`https://v3.sdrive.app/upload/video?id=${videoid}`);

      if (response.status === 200) {
        progress = response.data.message.percent_complete;
        if (response.data.message.finished) {
          // Video is ready
          clearInterval(intervalId); // Stop checking
          // Set the video source
          videoSrc = response.data.message.playlist;
          const videoElement = document.getElementById("myvideo");
          videoElement.src = response.data.message.playlist;
        }
      }
    } catch (error) {
      console.log("Video not ready yet", error);
    }
  }

  async function uploadFile(file) {
    videoid = null;
    loading = true;
    progress = 0;
    videoSrc = "";
    const id = createId();

    try {
      console.log("Uploading file...");
      console.log(file);

      let fileIndex = 0;
      const size = file.size;
      const mimeType = file.type;

      let result = await uploadSingleFile(file, fileIndex, false);

      console.log({ progress, result });
      const videoFile = uploadedFiles[0].link;

      const response = await axios.post("https://v3.sdrive.app/video/convert", {
        id: id,
        file_url: videoFile,
        apikey: "59eb26e69d7fe1349e00e6e89f724b9d",
        callback_url: "https://jobs.sdrive.app/callback",
        callback_method: "POST",
        size: size,
        mime_type: mimeType
      });
      clearInterval(intervalId); // Stop checking if we were already checking

      if (response.status === 200) {
        videoid = id;
        console.log(response.data);
        console.log("Upload successful", response.data);

        // Start checking for the video
        intervalId = setInterval(() => checkForVideo(id), 10000); // Check every 10 seconds
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  }
  let selectedFile;
  function handleFileChange(event) {
    const inputElement = event.target;
    const file = inputElement.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        selectedFile = file;
        loading = true;
        uploadFile(file);
      } else {
        console.log("Invalid file type. Please upload a video.");
      }
    }
  }
</script>

<div class="main">
  <h1>SDrive video HLS upload microservice</h1>
  <h2>Upload</h2>

  <form on:submit|preventDefault={uploadFile}>
    <input
      type="file"
      name="uploadfile"
      id="uploadfile"
      on:change={handleFileChange}
      accept="video/*"
    />
  </form>
  <button
    id="uploadArea"
    on:click={() => document.getElementById("uploadfile").click()}
    on:keydown={(e) => e.key === "Enter" && document.getElementById("uploadfile").click()}
    tabindex="0"
  >
    Click here to upload a video file
  </button>

  {#if selectedFile && !videoSrc}
    <p>Selected file: {selectedFile.name}</p>
  {/if}

  <!-- Display uploaded files -->
  {#each uploadedFiles as fileLink (fileLink)}
    <p class="break-all">{fileLink.link}</p>
    <p>{fileLink.name}</p>
  {/each}

  {#if videoid}
    <p>Video ID: {videoid}</p>
    <p>
      It's okay to close this page and come back later. We'll keep checking for the video and it
      will be ready to play on the Video page when it's done.<br />
      Otherwise, wait for the video to finish processing to see it below.
    </p>
  {/if}

  {#if loading && !videoSrc}
    <div class="progress-container">
      <div class="progress-bar" style="width: {progress}%">
        {progress}%
      </div>
    </div>
    <Jumper size="60" color="#FFaa00" unit="px" duration="1s" />
  {/if}

  {#if videoSrc}
    <mux-video src={videoSrc} controls />
  {/if}

  <ToastContainer let:data={toastdata}>
    <FlatToast {toastdata} />
  </ToastContainer>
</div>

<style>
  .progress-container {
    width: 90%;
    border-radius: 5px;
    background-color: #666;
  }

  .progress-bar {
    width: 0;
    height: 10px;
    background-color: #4caf50;
    text-align: center;
    line-height: 10px;
    color: white;
  }
  /* Hide the file input */
  #uploadfile {
    display: none;
  }
  #uploadArea {
    padding: 10px;
    display: flex;
    width: fit-content;
  }
  #uploadArea:hover {
    background-color: #222;
    color: white;
  }
  #uploadArea:active {
    background-color: #333;
  }
</style>
