import { defineStore } from 'pinia';

export const useCommandPaletteStore = defineStore('commandPalette', {
  state: () => ({
    isOpen: false,
  }),
  
  actions: {
    open() {
      this.isOpen = true;
    },
    
    close() {
      this.isOpen = false;
    },
    
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
});