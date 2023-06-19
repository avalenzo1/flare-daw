<template>
  <div :style="{ width: width + 'px', height: height + 'px', top: top + 'px', left: left + 'px' }"
    :class="isFullscreen ? 'fullscreen' : ''"  :hidden="isHidden"
    class="absolute overflow-auto select-a border-2 border-transparent rounded-lg transition-colors p-2 hover:resize hover:border-blue-600 hover:bg-opacity-10 hover:bg-blue-600"
    @resize="handleResize">
    <UCard class="w-full h-full" :class="isFullscreen ? 'rounded-none' : ''">
      <template #header>
        <div class="flex items-center">
          <span class="flex-1" :class="dragging ? 'cursor-grabbing' : 'cursor-grab'" @mousedown="handleStart" @touchstart="handleStart">{{ title }}</span>
          <UButtonGroup>
            <UButton :icon="isFullscreen ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'"
              @click="toggleFullscreen" variant="soft" />
            <UButton icon="i-heroicons-x-mark" color="red" variant="soft"></UButton>
          </UButtonGroup>
        </div>
      </template>

      <slot />
    </UCard>
  </div>
</template>

<style>
.fullscreen {
  @apply fixed !w-full !h-full !top-0 !left-0 !right-0 !bottom-0 rounded-none p-0 z-50;
}
</style>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "Window Title"
    },
    color: {
      type: String,
      default: "blue"
    }
  },
  data() {
    return {
      isHidden: false,
      isFullscreen: false,
      dragging: false,
      startLeft: 0,
      startTop: 0,
      left: 0,
      top: 0,
      marginLeft: 0,
      marginTop: 0,
      width: 600,
      height: 400,
    }
  },

  methods: {
    numberToPx(number) {
      return number + "px";
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },

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

      let boundingClientRect = e.target.parentNode.parentNode.parentNode.getBoundingClientRect();

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

      if (this.left < 0) this.left = 0;
      if (this.top < 0) this.top = 0;
    },
    handleEnd(e) {
      if (this.dragging) this.dragging = false;
    },
    
    handleResize(e) {
      console.log(e.target)

      this.width = e.target.width;
      this.height = e.target.height;
    }
  },

  beforeMount() {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('touchmove', this.handleMove);

    window.addEventListener('mouseup', this.handleEnd);
    window.addEventListener('touchend', this.handleEnd);
    window.addEventListener('touchcancel', this.handleEnd);
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