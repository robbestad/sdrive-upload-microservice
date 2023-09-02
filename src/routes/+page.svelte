<script>
	import axios from "axios";

  // Custom UI component.
	import { Jumper } from "svelte-loading-spinners";

	// Obtain a ref if you need to call any methods.
	let player;

	let loading = false;

	let file;
	let intervalId;
	let permalink;

	let videoid = ""//"vtg1y3y0275de1akx217gimq";
	let base = ""//"https://shdw-drive.genesysgo.net/GYSM8Nk9kw7rYz5NbRht8Mh9K3KKRKJ86sThxVzyF4n1"
	let videoSrc = ""//`${base}/${videoid}.m3u8`;

	async function checkForVideo(videoid) {
		try {
			const response = await axios.get(`https://v3.sdrive.app/upload/video?id=${videoid}`);

			if (response.status === 200) {
				console.log(response.data);
				if (response.data.message.finished) {
					// Video is ready
					clearInterval(intervalId); // Stop checking
					console.log("VIDEO READY");
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

	async function uploadFile(event) {
		const formData = new FormData();
		const fileInput = event.target.uploadfile.files[0];
		const filename = fileInput.name;
		loading = true;

		formData.append("fileupload", fileInput, filename); // The filename is just a string here

		formData.append("mimetype", file);
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
				permalink = response.data.permalink;
				videoid = response.data.id;
				console.log("Upload successful", response.data);

				// Start checking for the video
				intervalId = setInterval(() => checkForVideo(response.data.id), 5000); // Check every 5 seconds
			} else {
				console.error("Upload failed");
				loading = false;
			}
		} catch (error) {
			console.error("Upload failed", error);
			loading = false;
		}
	}
</script>

<h1>UPLOAD VIDEO</h1>

<form on:submit|preventDefault={uploadFile}>
	<input type="file" name="uploadfile" id="uploadfile" />
	<button type="submit">Upload</button>
</form>

{videoSrc}
{#if loading}
	<Jumper size="60" color="#FF3E00" unit="px" duration="1s" />
{/if}

{#if videoSrc}
<mux-video
  src={videoSrc}
  controls
>
</mux-video>
{/if}
