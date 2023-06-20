<template>
  <div :style="{ top: top + 'px', left: left + 'px' }"
    class="absolute overflow-auto border-2 border-transparent rounded-lg transition-colors p-2 hover:resize hover:border-blue-600 hover:bg-opacity-10 hover:bg-blue-600"
    @resize="handleResize">
    <slot></slot>
  </div>
</template>

<script>
// Yes this is a carbon copy of vue-drag-resize porque no sirve ese pm

export default {
  props: {
    dragHandle: {
      type: String
    },
    x: {
      type: Number
    },
    y: {
      type: Number
    },
    w: {
      type: Number
    },
    minH: {
      type: Number
    },
    h: {
      type: Number
    }
  },

  data() {
    return {
      active: null,
      zIndex: 0,
      parentWidth: null,
      parentHeight: null,
      left: null,
      top: null,
      right: null,
      bottom: null,
      minHeight: this.minH,

      dragHandleEl: null
    }
  },

  methods: {
    handleStart(e) {
      this.dragging = true;

      if (e.clientX || e.clientY) {
        this.startLeft = e.clientX;
        this.startTop = e.clientY;
      }

      if (e.touches) {
        this.startLeft = e.touches[0].clientX;
        this.startTop = e.touches[0].clientY;
      }

      let boundingClientRect = e.target.getBoundingClientRect();

      this.marginLeft = this.startLeft - boundingClientRect.x;
      this.marginTop = this.startTop - boundingClientRect.y;
    },
    handleMove(e) {
      if (!this.dragging) return;

      if (e.clientX || e.clientY) {
        this.left = e.clientX - this.marginLeft;
        this.top = e.clientY - this.marginTop;
      }

      if (e.touches) {
        this.left = e.touches[0].clientX - this.marginLeft;
        this.top = e.touches[0].clientY - this.marginLeft;
      }
    },
    handleEnd(e) {
      if (this.dragging) this.dragging = false;
    },

    handleResize(e) {
      console.log(e.target)
    }
  },

  created() {
    this.left = this.x;
    this.top = this.y;
    this.minHeight = this.minH;
  },

  beforeMount() {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('touchmove', this.handleMove);

    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('touchmove', this.handleMove);

    window.addEventListener('mouseup', this.handleEnd);
    window.addEventListener('touchend', this.handleEnd);
    window.addEventListener('touchcancel', this.handleEnd);
  },

  mounted() {
    if (this.dragHandle === null) return;

    let dragHandle = this.$el.querySelector(this.dragHandle);

    dragHandle.addEventListener('touchstart', this.handleStart.bind(this));
    dragHandle.addEventListener('mousedown', this.handleStart.bind(this));
  },

  beforeUnmount() {
    let dragHandle = this.$el.querySelector(this.dragHandle);
      
    dragHandle.removeEventListener('touchstart', this.handleStart.bind(this));
    dragHandle.removeEventListener('mousedown', this.handleStart.bind(this));
  },

  beforeDestroy() {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('touchmove', this.handleMove);

    window.removeEventListener('mouseup', this.handleEnd);
    window.removeEventListener('touchend', this.handleEnd);
    window.removeEventListener('touchcancel', this.handleEnd);
  }
}
</script>