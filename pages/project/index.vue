<script setup lang="ts">
definePageMeta({
  layout: "project",
});

useSeoMeta({
  title: "New Project"
})
</script>

<template>
  <UContainer>
    <nav class="flex gap-2 relative">
      <UButton to="/" icon="i-heroicons-arrow-left"></UButton>

      <UFormGroup name="bpm" label="BPM">
        <UInput type="number" v-model.number="flare.bpm" step="1" min="1" max="999"></UInput>
      </UFormGroup>

      <UFormGroup name="time_signature" label="Time Signature">
        <UInput type="number" v-model.number="flare.timeSignature[0]" step="1" min="1" max="32"></UInput>
        <UInput type="number" v-model.number="flare.timeSignature[1]" step="1" min="1" max="32"></UInput>
      </UFormGroup>
    </nav>

    <aside>

    </aside>

    <main>
      <Window v-for="(track, i) in flare.tracks" :key="i + 1" :title="'Track Window ' + track.name" :w="400" :h="400"
        :x="400" :y="i * 100">
        <input type="range" :value="track.db * 80" disabled="true" />

        <PianoRollCanvas :track="track" />
      </Window>

      <div v-if="$mainStore.settings.allowIllegalPlugins">
        <Window title="YouTube Extractor" >
          <YouTubeExtractor />
        </Window>
      </div>

      <Window title="Editor">
        <UButtonGroup class="mb-2">

          <UButton @click="flare.toggle()" :label="flare.paused ? 'Play' : 'Pause'"
            :icon="flare.paused ? 'i-heroicons-play' : 'i-heroicons-pause'" color="primary" :loading="state.loading" />

          <UButton @click="flare.stop()" label="Stop" icon="i-heroicons-stop" color="red" :loading="state.loading"
            :disabled="flare.paused" />
        </UButtonGroup>

        <ul>
          <li v-for="track in flare.tracks">
            <div class="flex items-end gap-4">
              <UButton color="blue">View</UButton>

              <UFormGroup name="name" label="Name">
                <UInput type="text" v-model="track.name" step="0.1" min="-1" max="1"></UInput>
              </UFormGroup>

              <UFormGroup name="pan" label="Pan">
                <input type="range" class="w-12" v-model.number="track.panNode.pan.value" step="0.1" min="-1" max="1" />
              </UFormGroup>

              <UFormGroup name="gain" label="Gain">
                <input type="range" class="w-12" v-model.number="track.gainNode.gain.value" step="0.1" min="0" max="2" />
              </UFormGroup>

              <UFormGroup name="pitch" label="Pitch">
                <input type="range" class="w-12" v-model.number="track.playbackRate" step="0.05" min="0.25" max="3" />
              </UFormGroup>
            </div>

            <TrackEditorCanvas />
          </li>
        </ul>
      </Window>
    </main>

  </UContainer>
</template>

<script lang="ts">
import { Flare, SampleTrack, PianoRollTrack } from '@/assets/flare';

export default {
  data() {
    return {
      state: {
        loading: true
      },
      flare: new Flare(),
    }
  },

  methods: {
    async createTrack(track: Track, trackProperties: TrackProperties) {
      this.state.loading = true;

      this.flare.tracks.push(new track(trackProperties, { gain: 0, pan: 0, muted: false, ctx: this.flare.ctx }));

      this.state.loading = false;
    }
  },

  async mounted() {
    await this.createTrack(SampleTrack, { name: "Metronome", color: "red" });
    await this.createTrack(SampleTrack, { name: "Find A Way", color: "red" });
    await this.createTrack(PianoRollTrack, { name: "Piano Roll", color: "red" });

    this.state.loading = true;

    try {
      // Fetches path

      await this.flare.tracks[0].fetchAudio("C:/Users/avale/Desktop/electron/flare/assets/Duvet.mp3");


    } catch (error) {
      console.warn(error)
      new Audio("/notification/warning.wav").play();
      this.$toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "yellow" })
    }

    try {
      // Fetches path

      await this.flare.tracks[1].fetchAudio("Find A Way.mp3");
      // await this.flare.tracks[1].reverse();

      this.flare.tracks[1].playbackRate = 0.75;
    } catch (error) {
      console.warn(error)
      new Audio("/notification/warning.wav").play();
      this.$toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "yellow" })
    }

    this.flare.bpm = 80;

    this.state.loading = false;
  },

  beforeMount() {

  },

  beforeUnmount() {
    this.flare.ctx.close();
  }
}
</script>