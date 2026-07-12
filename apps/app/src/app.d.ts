// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  const APP_VERSION: string;
  const CORE_VERSION: string;
}

export {};

declare module "*.css" {
  const content: any;
  export default content;
}
