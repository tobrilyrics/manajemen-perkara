import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { getOAuthConsentURL } from "$lib/server/oauth";
import { OAUTH_CREDENTIALS_COOKIE } from "$env/static/private";
import type { Auth } from "googleapis";

export async function GET(ev: RequestEvent) {
  let code = ev.url.searchParams.get("code");
  if (code) {
    let { tokens } = await ev.locals.oauth.getToken(code);
    let oauthCookie = ev.cookies.get(OAUTH_CREDENTIALS_COOKIE)
    let cred: Auth.Credentials = {}
    if (oauthCookie) {
      try {
        cred = JSON.parse(oauthCookie)
      } catch { }
    }
    const cookie_cred = { ...cred, ...tokens }
    ev.locals.oauth.setCredentials(cookie_cred);
    ev.cookies.set(OAUTH_CREDENTIALS_COOKIE, JSON.stringify(cookie_cred), {
      path: "/",
      expires: new Date(new Date().getFullYear() + 10, 0)
    });
    redirect(302, "/");
  } else {
    redirect(302, getOAuthConsentURL(ev.locals.oauth));
  }
}
