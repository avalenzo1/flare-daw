import { defineStore } from 'pinia';

type FlareGlobalSettings = {
  language: string;
  allowIllegalPlugins: boolean;
}

export const useMainStore = defineStore('main', {
  state: () => ({ 
    settings: {
      language: 'English',
      allowIllegalPlugins: false
    },
  }),
  getters: {},
  actions: {
    updateSettings(partialSettings: FlareGlobalSettings) {
      this.settings = {
        ...this.settings,
        ...partialSettings,
      }
    },
  },
  persist: true
});