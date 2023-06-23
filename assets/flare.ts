import {v4 as uuidv4} from 'uuid';

const UUID = () => {
  return uuidv4()
};

type AudioOptions = {
  ctx: AudioContext;
  muted: boolean;
  gain: number;
  pan: number;
  playBackRate: number;
}

type TrackProperties = {
  name: string;
  color: string
}

class Channel {
  constructor() {}
}

class EffectsChain {
  
}

class Track {
  public UUID: string;

  public name : string;
  public color : string;

  public ctx : AudioContext;
  public source : AudioBufferSourceNode;
  public buffer : AudioBuffer;

  public panNode : StereoPannerNode;
  public gainNode : GainNode;
  public analyserNode : AnalyserNode;

  private _playbackRate : number;

  public pcmData : Float32Array;
  public db : number;

  constructor({name, color} : TrackProperties, {
    playBackRate,
    ctx,
    muted,
    gain,
    pan
  } : AudioOptions) {
    this.UUID = UUID();

    this.name = name;
    this.color = color;

    this.ctx = ctx;

    this.source = this.ctx.createBufferSource();
    this.buffer = this.ctx.createBuffer(1, 1, 44100);

    this.panNode = this.ctx.createStereoPanner();
    this.panNode.pan.value = pan || 0;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = gain || 1;

    this.analyserNode = this.ctx.createAnalyser();
    this.pcmData = new Float32Array(this.analyserNode.fftSize);
    this.reqId = null;
    this.db = 0;

    this._playbackRate = 1;

    this.effects = [];
  }

  get playbackRate() {
    return this._playbackRate;
  }

  set playbackRate(playbackRate : number) { // holy. Why do I need to do this?
    this._playbackRate = playbackRate;

    this.source.playbackRate.value = this._playbackRate;
  }

  /**
     * toggleReverse will reverse audio 
     *
     * @returns void
     */

  async reverse(): Promise<void> {
    if (this.buffer === null) return;

    Array.prototype.reverse.call( this.buffer.getChannelData(0) );
    Array.prototype.reverse.call( this.buffer.getChannelData(1) );
  }

  /**
     * createBuffer saves parsed audio asset to reuse when needed
     *
     * @param {AudioBuffer} buffer 
     * @returns void
     */

  createBuffer(buffer : AudioBuffer) {
    this.buffer = buffer;

    
  }

  /**
     * initializeBuffer initializes all Nodes
     *
     * @returns void
     */

  initializeBuffer(): void { // Creates Audio Buffer Source Node
    this.source = this.ctx.createBufferSource();

    // Reinserts existing Buffer Array
    this.source.buffer = this.buffer;

    // Sets playbackRate

    console.log(this.source.playbackRate)

    this.source.playbackRate.value = this.playbackRate;

    // [AudioBufferSourceNode] => [GainNode] => [StereoPannerNode] => [AnalyserNode] => Output


    // TODO: Split the Node So that there is a wetness/dryness knob
    // Idea: Create UI like Blender for Audio Context for effects!!!!

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.panNode);
    this.panNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  async play(): Promise<void> {
    this.reqId = window.requestAnimationFrame(this.frame.bind(this));

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    } else {
      console.log("heyyy")
      this.initializeBuffer();

      this.source.start(0);
    }
  }

  async pause(): Promise<void> {
    window.cancelAnimationFrame(this.reqId);

    if (this.ctx.state === 'running') {
      await this.ctx.suspend();
    }
  }

  async stop(): Promise<void> {
    if (!(this.ctx.state === 'closed')) 
      await this.source.stop(0);
    
    window.cancelAnimationFrame(this.reqId);
  }

  frame() {
    this.analyserNode.getFloatTimeDomainData(this.pcmData);

    let sumSquares = 0.0;
    for (const amplitude of this.pcmData) {
      sumSquares += amplitude * amplitude;
    }

    this.db = Math.sqrt(sumSquares / this.pcmData.length);

    this.reqId = window.requestAnimationFrame(this.frame.bind(this));
  }
}

class RecorderTrack extends Track {}

class SampleTrack extends Track {
  path : string;

  constructor(trackProperties : TrackProperties, audioOptions : AudioOptions) {
    super(trackProperties, audioOptions);

    this.path = "";

  }

  async fetchAudio(path : string) {
    console.log(path)
    let res = await fetch(path);

    if (res.ok) {
      let data = await res.arrayBuffer();
      let arrayBuffer = await this.ctx.decodeAudioData(data);

      this.createBuffer(arrayBuffer);
    } else {
      // An error occured

      // File was not found
      if (res.status === 404) {
        throw new Error(`${path} does not exist.`);
      }

      // Unexpected
      throw new Error(`An error with status code (${
        res.status
      }) occured`);
    }
  }
}

class PianoRollTrack extends Track {
  oscillator: OscillatorNode

  constructor(trackProperties : TrackProperties, audioOptions : AudioOptions) {
    super(trackProperties, audioOptions);

    console.log(this.ctx);

    this.oscillator = this.ctx.createOscillator();
    // create Oscillator node
    
  }

  async playNote()
  {
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = "square";
    this.oscillator.frequency.setValueAtTime(440, this.ctx.currentTime); // value in hertz
    this.oscillator.connect(this.ctx.destination);
    this.oscillator.start(0);
    this.oscillator.stop(1);
  }
}

class Flare {
  ctx : AudioContext;
  tracks : Track[];
  channels : Channel[];
  timeSignature : any;
  paused : boolean;
  time : number;
  bpm : number;

  constructor() {
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
      } else {
        track.play();
      }
    }
  }
}

export {
  Flare,
  Track,
  PianoRollTrack,
  SampleTrack,
  RecorderTrack
};
