import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(nuxtApp => {
  return {
    provide: {
      toast: useToast()
    }
  }
})