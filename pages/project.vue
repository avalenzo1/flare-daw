<script setup lang="ts">
const toast = useToast();
</script>

<template>
  <div class="flex gap-2 relative">
    <UButton to="/" icon="i-heroicons-arrow-left"></UButton>

    <UFormGroup name="bpm" label="BPM">
      <UInput type="number" v-model.number="flare.bpm" step="1" min="1" max="999"></UInput>
    </UFormGroup>

    <UFormGroup name="time_signature" label="Time Signature">
      <UInput type="number" v-model.number="flare.timeSignature[0]" step="1" min="1" max="32"></UInput>
      <UInput type="number" v-model.number="flare.timeSignature[1]" step="1" min="1" max="32"></UInput>
    </UFormGroup>
  </div>

  <WindowGroup>
    <Window title="Editor">
      <UButtonGroup>
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
          </div>
        </li>
      </ul>
    </Window>

    <Window v-for="track in flare.tracks" :title="'Track Window ' + track.name" :color="track.color">


      <input type="range" :value="track.db * 80" disabled="true" />

      {{ track }}
    </Window>
  </WindowGroup>
</template>

<script lang="ts">
import { v4 as uuidv4 } from 'uuid';

const toast = useToast();
const UUID = () => { return uuidv4() };

type AudioOptions = {
  muted: boolean;
  gain: number;
  pan: number;
}

type TrackProperties = {
  name: string
  color: string
}

class Channel {
  constructor() {

  }
}

class Track {
  UUID: string;

  name: string;
  color: string;

  ctx: AudioContext;
  source: AudioBufferSourceNode;
  buffer: AudioBuffer;

  panNode: StereoPannerNode;
  gainNode: GainNode;
  analyserNode: AnalyserNode;

  pcmData: Float32Array;
  db: number;

  constructor({ name, color }: TrackProperties, { muted, gain, pan }: AudioOptions) {
    this.UUID = UUID();

    this.name = name;
    this.color = color;

    this.ctx = new AudioContext();
    this.source = this.ctx.createBufferSource();

    this.panNode = this.ctx.createStereoPanner();
    this.panNode.pan.value = pan || 0;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = gain || 1;

    this.analyserNode = this.ctx.createAnalyser();
    this.pcmData = new Float32Array(this.analyserNode.fftSize);
    this.reqId = null;
    this.db = 0;

    this.effects = [];
  }

  /**
     * createBuffer saves parsed audio asset to reuse when needed
     *
     * @param {AudioBuffer} buffer 
     * @returns
     */

  createBuffer(buffer: AudioBuffer) {
    this.buffer = buffer;
  }

  initializeBuffer() {
    // Creates Audio Buffer Source Node
    this.source = this.ctx.createBufferSource();

    // Reinserts existing Buffer Array
    this.source.buffer = this.buffer;

    // [AudioBufferSourceNode] => [GainNode] => [StereoPannerNode] => [AnalyserNode] => Output

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.panNode);
    this.panNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  async play() {
    this.reqId = window.requestAnimationFrame(this.frame.bind(this));

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    else {
      console.log("heyyy")
      this.initializeBuffer();
      this.source.start(0);
    }
  }

  async pause() {
    window.cancelAnimationFrame(this.reqId);

    if (this.ctx.state === 'running') {
      await this.ctx.suspend();
    }

    this.initializeBuffer();
  }

  async stop() {
    // TODO: Fix bug where audio doesn't stop when played after paused
    console.log(this.ctx.state);
    console.log(this.ctx)
    if (!(this.ctx.state === 'closed')) await this.source.stop(0);

    window.cancelAnimationFrame(this.reqId);
  }

  frame() {
    this.analyserNode.getFloatTimeDomainData(this.pcmData);

    let sumSquares = 0.0;
    for (const amplitude of this.pcmData) { sumSquares += amplitude * amplitude; }

    this.db = Math.sqrt(sumSquares / this.pcmData.length);

    this.reqId = window.requestAnimationFrame(this.frame.bind(this));
  }
}

class RecorderTrack extends Track {

}

class SampleTrack extends Track {
  path: string;

  constructor({ name, color }: TrackProperties, { muted, gain, pan }: AudioOptions) {
    super({ name, color }, { muted, gain, pan });

    this.path = "";

  }

  async fetchAudio(path: string) {
    let res = await fetch(path);

    if (res.ok) {
      let data = await res.arrayBuffer();
      let arrayBuffer = await this.ctx.decodeAudioData(data);

      this.createBuffer(arrayBuffer);
    }
    else {
      // An error occured

      // File was not found
      if (res.status === 404) {
        throw new Error(`${path} does not exist.`);
      }

      // Unexpected
      throw new Error(`An error with status code (${res.status}) occured`);
    }
  }
}

class PianoRollTrack extends Track {

}

class Flare {
  tracks: Track[];
  channels: Channel[];
  timeSignature: any;
  paused: boolean;
  time: number;
  bpm: number;

  constructor(){
    this.tracks = [];
    this.channels = [];
    this.paused = true;
    this.timeSignature = [4, 4];
    this.time = 0;
    this.bpm = 130; // 1000 * 60 / this.bpm
  }

  async stop() {
    this.paused = true;

    for (let track of this.tracks) {
      track.stop();
    }
  }

  toggle() {
    this.paused = !this.paused;

    for (let track of this.tracks) {
      if (this.paused) {
        track.pause();
      }

      else {
        track.play();
      }
    }
  }
}

export default {
  data() {
    return {
      state: {
        loading: true
      },
      flare: new Flare()
    }
  },

  methods: {
    async createTrack(TrackProperties: TrackProperties) {
      this.state.loading = true;

      let track = new SampleTrack(TrackProperties, { gain: 0, pan: 0, muted: false });
      this.flare.tracks.push(track);

      this.state.loading = false;
    }
  },

  async mounted() {
    console.log("test")

    this.createTrack({ name: "Metronome", color: "red" });
    this.createTrack({ name: "Find A Way", color: "red" });

    try {
      // Fetches path

      await this.flare.tracks[0].fetchAudio("metronome/1.ogg");
    } catch (error) {
      console.warn(error)
      new Audio("/notification/warning.wav").play();
      toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "yellow" })
    }

    try {
      // Fetches path

      await this.flare.tracks[1].fetchAudio("Find A Way.mp3");
    } catch (error) {
      console.warn(error)
      new Audio("/notification/warning.wav").play();
      toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "yellow" })
    }

    this.flare.bpm =266;
  },

  beforeMount() {

  },

  async beforeDestroy() {
    await this.flare.stop();
  }
}
</script>