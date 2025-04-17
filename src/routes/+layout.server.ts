import type { RequestEvent } from "./$types";

export async function load(ev: RequestEvent) {
  return {
    user: ev.locals.payload,
  }
}
