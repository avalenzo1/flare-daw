<template>
  <div :style="{ top: top + 'px', left: left + 'px', minHeight: this.minH + 'px' }" class="nuxt-drag-resize" @resize="handleResize"
    @click="handleClick">
    <slot></slot>
  </div>
</template>

<style>
.nuxt-drag-resize {
  @apply absolute max-w-full overflow-auto rounded-lg transition-colors p-2 hover:outline hover:resize hover:outline-blue-600 hover:bg-opacity-10 hover:bg-blue-600;
}
</style>

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
      parentWidth: null,
      parentHeight: null,
      left: this.x,
      top: this.y,

      dragHandleEl: null
    }
  },

  methods: {
    handleClick() {
      // If NuxtDragResize is clicked, creates EventListener for 'handleFlyout'
      // Checks if user clicks outside of NuxtDragResize component
      if (!this.active) {
        this.bringToFront();
        window.addEventListener('click', this.handleFlyout);
      }
    },
    handleStart(e) {
      this.dragging = true;

      this.bringToFront();

      if (!this.active) {
        window.addEventListener('click', this.handleFlyout);
      }

      if (e.clientX || e.clientY) {
        this.startLeft = e.clientX;
        this.startTop = e.clientY;
      }

      if (e.touches) {
        this.startLeft = e.touches[0].clientX;
        this.startTop = e.touches[0].clientY;
      }

      let boundingClientRect = e.target.closest('.nuxt-drag-resize').getBoundingClientRect();

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
    handleFlyout(e) {
      if (this.active) return;

      let componentElement = this.$el;
      let targetElement = e.target;

      // While the targetted element is exists...

      while (targetElement) {
        // If the target Element is equal to the flyout element
        // Sets active to true
        if (componentElement == targetElement) {
          this.bringToFront();

          return;
        }

        // This will go to parentNode until it finds (or does't find) the find this.$el (The NuxtDragComponent)
        targetElement = targetElement.parentNode;
      }

      this.active = false;

      window.removeEventListener('click', this.handleFlyout);
    },
    handleResize(e) {
      console.log(e.target)
    },
    bringToFront() {
      let componentParentElement = this.$el.parentNode;
      let componentElement = this.$el;

      componentParentElement.removeChild(componentElement);
      componentParentElement.appendChild(componentElement);

      this.active = true;
    }
  },

  beforeMount() {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('touchmove', this.handleMove);

    window.addEventListener('mouseup', this.handleEnd);
    window.addEventListener('touchend', this.handleEnd);
    window.addEventListener('touchcancel', this.handleEnd);
  },

  mounted() {
    if (this.dragHandle === null) return;

    let dragHandle = this.$el.querySelector(this.dragHandle);

    // Is the bind(this) necessary to write out?
    dragHandle.addEventListener('touchstart', this.handleStart);
    dragHandle.addEventListener('mousedown', this.handleStart);

    this.$el.style.height = this.h + 'px';
  },

  beforeUnmount() {
    let dragHandle = this.$el.querySelector(this.dragHandle);

    dragHandle.removeEventListener('touchstart', this.handleStart);
    dragHandle.removeEventListener('mousedown', this.handleStart);
  },

  beforeDestroy() {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('touchmove', this.handleMove);

    window.removeEventListener('mouseup', this.handleEnd);
    window.removeEventListener('touchend', this.handleEnd);
    window.removeEventListener('touchcancel', this.handleEnd);

    window.removeEventListener('click', this.handleFlyout);
  }
}
</script>