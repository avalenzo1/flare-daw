<template>
  <div class="relative" @resize="handleResize" @mouseenter="this.active = true" @mouseleave="this.active = false"></div>
</template>
  
<script lang="ts">
import * as PIXI from 'pixi.js';
import { Button, ScrollBox, List } from '@pixi/ui';

export default {
  props: {
    track: {
      required: true
    }
  },

  data() {
    return {
      active: false,
      pixiApp: null,
      resizeObserver: null,
      midiAccess: null
    }
  },

  methods: {
    async createPixiApp() {
      // Guauuu amo el Javascript tanto
      // Holy. Get a load of this.
      const nuxtApp: any = this;

      const app = new PIXI.Application({
        width: 600,
        height: 400,
      });

      function noteToFreq(note: number) {
        let a = 440; //frequency of A (coomon value is 440Hz)
        return (a / 32) * (2 ** ((note - 9) / 12));
      }

      this.$toast.add({ title: "MIDI Access successfull" });

      if (this.midiAccess) {
        for (const input of this.midiAccess.inputs.values()) {
          input.onmidimessage = getMIDIMessage;
        }

        async function getMIDIMessage(message: any) {
          const command = message.data[0];
          const note = message.data[1];
          const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

          switch (command) {
            case 144: // noteOn
              if (velocity > 0) {
                console.log(note, velocity)
                await nuxtApp.track.playNote({ frequency: noteToFreq(note) }, velocity);
              } else {
                console.log(note)
              }
              break;
            case 128: // noteOff
              await nuxtApp.track.stopNote({ frequency: noteToFreq(note) });
              break;
            // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
          }
        }
      }


      const PIANO_WHITE_KEY_WIDTH = 80;
      const PIANO_WHITE_KEY_HEIGHT = 15;
      const PIANO_BLACK_KEY_WIDTH = 55;
      const PIANO_BLACK_KEY_HEIGHT = 11.5;
      const PIANO_KEYS = [
        {
          isWhite: true,
          note: "A"
        },
        {
          isWhite: false,
          note: "A#"
        },
        {
          isWhite: true,
          note: "B"
        },
        {
          isWhite: true,
          note: "C"
        },
        {
          isWhite: false,
          note: "C#"
        },
        {
          isWhite: true,
          note: "D"
        },
        {
          isWhite: false,
          note: "D#"
        },
        {
          isWhite: true,
          note: "E"
        },
        {
          isWhite: true,
          note: "F"
        },
        {
          isWhite: false,
          note: "F#"
        },
        {
          isWhite: true,
          note: "G"
        },
        {
          isWhite: false,
          note: "G#"
        }
      ];
      const PIANO_OCTAVE_RANGE = 9;

      const scrollbox = new ScrollBox({
        width: PIANO_WHITE_KEY_WIDTH,
        height: app.view.height
      });

      function create_key_listener(key: Button, note: string, octave: number) {
        key.onDown.connect(async () => {
          if (!nuxtApp.active) return;

          await nuxtApp.track.playNote({ note, octave });
          console.log(note, octave)
        });

        key.onUp.connect(async () => {
          if (!nuxtApp.active) return;

          await nuxtApp.track.stopNote({ note, octave });
          console.log(note)
        });
      }

      function init_gui() {
        app.stage.addChild(scrollbox);

        for (let octave = 0; octave < PIANO_OCTAVE_RANGE; octave++) {
          const list = new List();

          // Render for each octave
          for (let key = 0; key < PIANO_KEYS.length; key++) {
            const pianoKeyFill = PIANO_KEYS[key].isWhite ? 0xFFFFFF : 0x000000;
            const pianoKeyStroke = PIANO_KEYS[key].isWhite ? 0x3F3F3F : 0x333333;
            const pianoKeyWidth = PIANO_KEYS[key].isWhite ? PIANO_WHITE_KEY_WIDTH : PIANO_BLACK_KEY_WIDTH;
            const pianoKeyHeight = PIANO_KEYS[key].isWhite ? PIANO_WHITE_KEY_HEIGHT : PIANO_BLACK_KEY_HEIGHT;

            // Draw keys
            const pianoKey = new Button(
              new PIXI.Graphics()
                .beginFill(pianoKeyFill)
                .lineStyle(1, pianoKeyStroke)
                .drawRect(0, 0, pianoKeyWidth, pianoKeyHeight)
            );

            // Create Event Listener for Key
            create_key_listener(pianoKey, PIANO_KEYS[key].note, octave);

            list.addChild(
              pianoKey.view
            );

            scrollbox.addItem(list);
          }
        }
      }

      // function loop_gui()
      // {
      //   scrollbox.scrollTop()

      //   window.requestAnimationFrame(loop_gui);
      // }

      init_gui();
      // window.requestAnimationFrame(loop_gui);

      console.log(app)

      return app;
    },
    async destroyPixiApp() {

      // JS memory leak causes exceed limit in OpenGL intances
      this.resizeObserver.disconnect();
      this.pixiApp.stage.destroy({
        children: true,
        texture: true,
        baseTexture: true
      });
    },
  },

  async mounted() {
    if (this.track === undefined) this.$toast.add({ title: 'No track given.' });

    try {
      this.midiAccess = await navigator.requestMIDIAccess();

    } catch (error: any) {
      new Audio("/notification/warning.wav").play();
      this.$toast.add({ title: error.message, icon: "i-heroicons-exclamation-circle", color: "yellow" });
    }

    this.pixiApp = await this.createPixiApp();

    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {

        // dynamically adjust the UI layout
        const { width, height } = entry.contentRect;

        this.pixiApp.screen.width = this.pixiApp.view.width = width;
        this.pixiApp.screen.height = this.pixiApp.view.height = height;
      }
    });

    this.resizeObserver.observe(this.$el);

    this.$el.appendChild(this.pixiApp.view);
  },

  beforeDestroy() {
    this.destroyPixiApp();
  }
}
</script>