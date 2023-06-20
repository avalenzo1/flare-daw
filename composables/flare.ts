import { v4 as uuidv4 } from 'uuid';

const UUID = () => { return uuidv4() };

type AudioOptions = {
  ctx: AudioContext
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

  constructor({ name, color }: TrackProperties, { ctx, muted, gain, pan }: AudioOptions) {
    this.UUID = UUID();

    this.name = name;
    this.color = color;

    this.ctx = ctx;

    console.log(this.ctx)

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

  constructor({ name, color }: TrackProperties, { ctx, muted, gain, pan }: AudioOptions) {
    super({ name, color }, { ctx, muted, gain, pan });

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
  ctx: AudioContext;
  tracks: Track[];
  channels: Channel[];
  timeSignature: any;
  paused: boolean;
  time: number;
  bpm: number;

  constructor(){
    this.ctx = new AudioContext();
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

export { Flare, Track, PianoRollTrack, SampleTrack, RecorderTrack };