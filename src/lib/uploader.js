import axios from "axios";
import { writable } from "svelte/store";
import { createId } from "@paralleldrive/cuid2";

let chunkSize = 1048576 * 7; //Multiplier is in MB
let userid = "1704725354";
let username = "rabbagast";
let storage_account ="Aqn5ACrx2tsnnoKkJNoBnuBHX5nitSnaYA9h7tcK7iqg";
let user_pubkey = "svenafMgAFwWq5ZfoHBPRdxxCWbZtnnnA7S2bzppTYT";
let counter = 0; // Assuming a counter for tracking progress

const URLS = {
  uploadchunks: "https://upload.sdrive.app/upload_data_chunks",
  process: "https://upload.sdrive.app/processupload",
  complete: "https://upload.sdrive.app/complete_upload",
  reassemble: "https://upload.sdrive.app/reassemble_upload"
};

// Svelte stores for reactive variables
export let reponseFromUpload = writable([]);

// Other Svelte stores like subscription, account, etc.
let upload_progress = 0;

const uploadCompleted = async (file, totalChunkCount, fileGuid, fileIndex, chunks, path) => {
  //console.log(file)
  const completeresponse = await axios.post(URLS.reassemble, {
    fileName: fileGuid,
    chunkCount: totalChunkCount,
    chunks,
  })
  console.log(completeresponse)

  const uploadresponse = await axios.post(URLS.process, {
    fileName: file.name,
    guid: fileGuid,
    fileSize: file.size,
    fileIndex: fileIndex,
    count: totalChunkCount,
    owner: user_pubkey,
    storageAccount: storage_account,
    userid: userid,
    encrypted: false,
    transcode: false,
    username: username,
    mime: file?.type || "application/octet-stream",
    ext: file?.name.split(".").pop(),
    folder: path.split("/").slice(0, -1).join("/") || "/",
  })
  if (uploadresponse.status === 202) {
    $: console.log(uploadresponse.data)
    let fileLink = {
      name: uploadresponse.data,
      link: `https://download.sdrive.app/public/${storage_account}/${fileGuid}`
    }
    console.log({fileLink})
    reponseFromUpload.update((n) => [...n, fileLink])
    //toast.success(`${file.name} uploaded successfully${file.size > 524000000 ? ", but it will take some time to process" : ""}`)
  }
}


const uploadChunk = async (
  chunk,
  chunkIndex,
  fileId,
  totalChunks,
  fileName
) => {
  console.log(`chunkIndex: ${chunkIndex} of ${totalChunks}`);

  const formData = new FormData();
  formData.append('file', new Blob([chunk], { type: 'application/octet-stream' }), fileName);

  const maxRetries = 3;
  let retries = 0;

  const attemptUpload = async () => {
    try {
      const response = await axios.post(URLS.uploadchunks, formData, {
        params: {
          id: chunkIndex,
          fileName: fileName,
          identifier: fileId,
        },
      });

      return response;
    } catch (error) {
      retries++;
      if (retries <= maxRetries) {
        console.log(`Retrying chunk upload ${retries}/${maxRetries} for chunkIndex ${chunkIndex}`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
        return attemptUpload();
      } else {
        return Promise.reject()
      }
    }
  };

  try {
    const response = await attemptUpload();
    const data = response.data;
    if (response.status === 201) {
      const percentage = (counter / totalChunks) * 100;
      return percentage;
    } else {
      toast.error("Error Occurred:" + data.errorMessage);
      return 0;
    }
  } catch (error) {
    //toast.error("Error Occurred: Failed to upload chunk after multiple retries");
    return 0;
  }
};


const uploadSingleFile = async (file, fileIndex) => {
  let fileGuid = `sdrive_${createId()}`;

  const totalCount = file.size % chunkSize === 0 ? file.size / chunkSize : Math.floor(file.size / chunkSize) + 1
  $: console.log(`Number of chunks: ${totalCount}`);

  let chunkIndex = 0
  const uploadChunkPromises = []
  let totalSizeUploaded = 0;
  const chunks = []

  while (chunkIndex < totalCount) {
    const uploadChunkPromisesBatch = []
    const remainingChunks = totalCount - chunkIndex
    const batchChunkCount = Math.min(3, remainingChunks)
    for (let i = chunkIndex; i < chunkIndex + batchChunkCount; i++) {
      const chunk = file.slice(i * chunkSize, i * chunkSize + chunkSize)
      totalSizeUploaded += chunk.size;
      let fileId = `sdrive_${createId()}`

      chunks.push({ fileId, chunkIndex: i });
      const promise = uploadChunk(chunk, i, fileId, totalCount, fileId); // Assuming uploadChunk is defined elsewhere
      uploadChunkPromisesBatch.push(promise);

        promise.then((percentage) => {
            upload_progress += percentage;
            counter++;
            console.log(`Upload progress: ${upload_progress}`);
        });
    }
    await Promise.all(uploadChunkPromisesBatch)
    chunkIndex += batchChunkCount
    uploadChunkPromises.push(...uploadChunkPromisesBatch)
  }
  console.log(chunks)

  await Promise.all(uploadChunkPromises)
  console.log("upload completed", file)

  await uploadCompleted(file, totalCount, fileGuid, fileIndex, chunks, file.path || "/")

  return "done"
}

export { uploadSingleFile };
