import type { Auth } from "googleapis";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      oauth: Auth.OAuth2Client;
      payload?: Auth.TokenPayload;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
