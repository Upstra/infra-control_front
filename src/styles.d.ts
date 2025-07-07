declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'vue-toast-notification/dist/theme-bootstrap.css' {
  const content: any;
  export default content;
}

declare module '@xterm/xterm/css/xterm.css' {
  const content: any;
  export default content;
}
