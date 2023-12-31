

<template>
  <form @submit.prevent="submit" class="flex flex-col gap-2">
    <UInput v-model="url" @change="fetchVideoDetails" :loading="loading"></UInput>

    <div v-if="videoInfo" class="relative">
      <iframe width="426" height="240" :src="this.videoInfo.videoDetails.embed.iframeUrl" title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
    </div>

    <UFormGroup name="filePath" label="Directory Path">
      <UInput v-model="filePath" @click="openDirectory"></UInput>
    </UFormGroup>

    <UFormGroup name="fileName" label="File Name">
      <UInput v-model="fileName"></UInput>
    </UFormGroup>

    <UFormGroup name="fileType" label="File Type">
      <USelectMenu v-model="fileType" :options="supportedFileTypes"></USelectMenu>
    </UFormGroup>

    <UButton type="submit" :loading="loading">Download</UButton>
  </form>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data() {
    return {
      loading: false,
      
      supportedFileTypes: ['mp3', 'wav', 'ogg'],

      url: "https://www.youtube.com/shorts/Ge89RlkfBKg",
      filePath: null,
      fileName: null,
      fileType: 'mp3',
      
      videoInfo: null
    }
  },
  methods: {
    async openDirectory() {
      const result = await ipcRenderer.invoke('open-directory');

      if (result.canceled) throw new Error("Canceled");

      this.filePath = result.filePaths[0];
    },
    async fetchVideoDetails() {
      this.loading = true;

      try {
        this.videoInfo = await $fetch(`/api/ytdl/info?url=${this.url}`);
        this.fileName = this.videoInfo.videoDetails.title;
      } catch (error) {
        this.$toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "red" });
      }

      this.loading = false;
    },
    async submit() {
      this.loading = true;

      try {
        // Fetch with directory to save to

        while (this.filePath === null) {
          await this.openDirectory();
        }
        
        const params = new URLSearchParams({
          url: this.url,
          filePath: this.filePath,
          fileName: this.fileName,
          fileType: this.fileType
        }).toString();

        const response = await $fetch(`/api/ytdl/download/?${params}`);

        this.$toast.add({
          title: "Sucessfully Downloaded Audio",
          actions: [
            {
              label: 'Open File',
              click: () => {
                // Creates window to path
                window.open(response.path, '_blank', 'location=yes,height=500,width=500,scrollbars=yes,status=yes');
              }
            },
            {
              label: 'Paste to Clipboard',
              click: () => {
                // Saves to clipboard
                navigator.clipboard.writeText(response.path);
              }
            }
          ]
        });
      } catch (error) {
        this.$toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "red" })
      }

      this.loading = false;
    }
  },
  mounted() {
    this.fetchVideoDetails();
  }
}
</script>