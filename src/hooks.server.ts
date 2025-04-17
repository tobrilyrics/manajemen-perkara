import { OAUTH_CREDENTIALS_COOKIE } from "$env/static/private";
import { getOAuthInstance, verify } from "$lib/server/oauth"
import { redirect, type Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  if(event.url.pathname === "/") throw redirect(302, "/perkara");

  event.locals.oauth = getOAuthInstance(event)
  event.locals.payload = await verify(event.locals.oauth, event);

  if (event.locals.payload === undefined) {
    event.cookies.delete(OAUTH_CREDENTIALS_COOKIE, { path: "/" });
  }

  return resolve(event)
}
