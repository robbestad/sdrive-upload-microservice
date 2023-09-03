<script>
  import axios from "axios";

  // Custom UI component.
  import { Jumper } from "svelte-loading-spinners";

  let loading = false;

  let intervalId;
  let progress = 0;

  let videoid = ""; //"vtg1y3y0275de1akx217gimq";
  let videoSrc = ""; //`https://shdw-drive.genesysgo.net/GYSM8Nk9kw7rYz5NbRht8Mh9K3KKRKJ86sThxVzyF4n1/${videoid}.m3u8`;

  async function checkForVideo(videoid) {
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
    console.log("Uploading file...");
    console.log(file);

    const formData = new FormData();
    const uploadfile = file;
    const filename = uploadfile.name;
    loading = true;
    videoid = "";
    videoSrc = "";
    formData.append("fileupload", uploadfile, filename); // The filename is just a string here
    formData.append("mimetype", file.type);
    formData.append("apikey", "59eb26e69d7fe1349e00e6e89f724b9d");
    formData.append("callback_url", "https://jobs.sdrive.app/callback");
    try {
      const response = await axios.post("https://v3.sdrive.app/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      clearInterval(intervalId); // Stop checking

      console.log(response.status);
      if (response.status === 200) {
        console.log(response.data);
        videoid = response.data.id;
        console.log("Upload successful", response.data);

        // Start checking for the video
        intervalId = setInterval(() => checkForVideo(response.data.id), 10000); // Check every 10 seconds
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

  {#if videoid}
    <p>Video ID: {videoid}</p>
    <p>
      It's okay to close this page and come back later. We'll keep checking for the video.
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
