import { defineNuxtPlugin } from "#app";
import { useMainStore } from "~/store/main";

export default defineNuxtPlugin((nuxtApp) => {

  return {
    provide: {
      mainStore: useMainStore()
    }
  }
});