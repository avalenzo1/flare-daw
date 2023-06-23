<template>
  <div class="relative" @resize="handleResize" @mousedown="this.active = true" @mouseup="this.active = false"></div>
</template>
  
<script>
import * as PIXI from 'pixi.js';
import { Button, ScrollBox } from '@pixi/ui';

export default {
  props: {
    track: {
      required: true
    }
  },

  data() {
    return {
      active: false
    }
  },

  mounted() {
    const app = new PIXI.Application({
      background: 0x333333,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {

        // dynamically adjust the UI layout
        const { width, height } = entry.contentRect;

        console.log(width);

        app.screen.width = app.view.width = width;
        app.screen.height = app.view.height = height;
      }
    });

    resizeObserver.observe(this.$el)

    this.$el.appendChild(app.view);

    const PIANO_WHITE_KEY_WIDTH = 80;
    const PIANO_WHITE_KEY_HEIGHT = 20;
    const PIANO_BLACK_KEY_WIDTH = 55;
    const PIANO_BLACK_KEY_HEIGHT = 11.5;
    const PIANO_WHITE_KEYS = ["A", "B", "C", "D", "E", "F", "G"];
    const PIANO_LENGTH = PIANO_WHITE_KEY_HEIGHT * PIANO_WHITE_KEYS.length;
    const PIANO_SCALE_RANGE = 3;

    const scrollbox = new ScrollBox({ background: 0x0f0f0f, width: app.screen.width, height: app.screen.height })

    // Odio el Javascript
    const cache = this;

    function init_gui() {
      const container = new PIXI.Container();

      scrollbox.addChild(container);
      app.stage.addChild(scrollbox);

      for (let scale = 0; scale < PIANO_SCALE_RANGE; scale++) {
        // Render for each scale
        for (let key = 0; key < PIANO_WHITE_KEYS.length; key++) {
          // Draw a white keys
          const whiteKey = new Button(
            new PIXI.Graphics()
              .beginFill(0xFFFFFF)
              .lineStyle(1, 0x3F3F3F)
              .drawRect(0, (PIANO_LENGTH * scale) + key * PIANO_WHITE_KEY_HEIGHT, PIANO_WHITE_KEY_WIDTH, PIANO_WHITE_KEY_HEIGHT)
          );

          let tempNote;

          whiteKey.onHover.connect(async () => {
            tempNote = await cache.track.playNote(PIANO_WHITE_KEYS[key], scale)
            console.log(PIANO_WHITE_KEYS[key])
          });

          whiteKey.onOut.connect(async () => {
            if (tempNote) tempNote.stop();
            console.log(PIANO_WHITE_KEYS[key])
          });

          container.addChild(whiteKey.view);
        }

        // Draw black keys

        // G# key
        const gSharpKey = new Button(
            new PIXI.Graphics()
              .beginFill(0x333333)
              .lineStyle(1, 0x000000)
              .drawRect(0, (PIANO_LENGTH * scale) - (PIANO_BLACK_KEY_HEIGHT / 2), PIANO_BLACK_KEY_WIDTH, PIANO_BLACK_KEY_HEIGHT)
          );

        container.addChild(gSharpKey.view);

        gSharpKey.onPress.connect(() => console.log("G#"));
        
        // A# key
        const aSharpKey = new Button(
            new PIXI.Graphics()
              .beginFill(0x333333)
              .lineStyle(1, 0x000000)
              .drawRect(0, (PIANO_LENGTH * scale) + PIANO_WHITE_KEY_HEIGHT - (PIANO_BLACK_KEY_HEIGHT / 2), PIANO_BLACK_KEY_WIDTH, PIANO_BLACK_KEY_HEIGHT)
          );

        container.addChild(aSharpKey.view);

        aSharpKey.onPress.connect(() => console.log("A#"));
        
        // C# key
        const cSharpKey = new Button(
            new PIXI.Graphics()
              .beginFill(0x333333)
              .lineStyle(1, 0x000000)
              .drawRect(0, (PIANO_LENGTH * scale) + PIANO_WHITE_KEY_HEIGHT * 3 - (PIANO_BLACK_KEY_HEIGHT / 2), PIANO_BLACK_KEY_WIDTH, PIANO_BLACK_KEY_HEIGHT)
          );

        container.addChild(cSharpKey.view);

        cSharpKey.onPress.connect(() => console.log("C#"));

        // D# key
        const dSharpKey = new Button(
            new PIXI.Graphics()
              .beginFill(0x333333)
              .lineStyle(1, 0x000000)
              .drawRect(0, (PIANO_LENGTH * scale) + PIANO_WHITE_KEY_HEIGHT * 4 - (PIANO_BLACK_KEY_HEIGHT / 2), PIANO_BLACK_KEY_WIDTH, PIANO_BLACK_KEY_HEIGHT)
          );

        container.addChild(dSharpKey.view);

        dSharpKey.onPress.connect(() => console.log("D#"));
        
        // F# key
        const fSharpKey = new Button(
            new PIXI.Graphics()
              .beginFill(0x333333)
              .lineStyle(1, 0x000000)
              .drawRect(0, (PIANO_LENGTH * scale) + PIANO_WHITE_KEY_HEIGHT * 6 - (PIANO_BLACK_KEY_HEIGHT / 2), PIANO_BLACK_KEY_WIDTH, PIANO_BLACK_KEY_HEIGHT)
          );

        container.addChild(fSharpKey.view);

        fSharpKey.onPress.connect(() => console.log("F#"));

        // Force calculations
        scrollbox.update()
      }
    }

    function draw_gui() {
      let appWidth = app.view.width;
      let appHeight = app.view.height;
    }

    init_gui();

    let y = 0;

    app.ticker.add((delta) => {
      draw_gui();
    });
  }
}
</script>