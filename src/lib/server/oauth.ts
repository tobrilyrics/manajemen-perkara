import { GOOGLE_API_KEY, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_CREDENTIALS_COOKIE } from "$env/static/private"
import type { RequestEvent } from "@sveltejs/kit"
import { google, Auth } from "googleapis"
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport"

export function getOAuthInstance(ev: RequestEvent) {
  let oauth = new google.auth.OAuth2({
    clientId: OAUTH_CLIENT_ID,
    clientSecret: OAUTH_CLIENT_SECRET,
    redirectUri: ev.url.origin + "/oauth",
    forceRefreshOnFailure: true
  })

  try {
    let cookiesCred = ev.cookies.get(OAUTH_CREDENTIALS_COOKIE)
    if (cookiesCred) {
      let cred = JSON.parse(cookiesCred)
      oauth.setCredentials(cred)
    }
  } catch (e) {
    console.log(e)
  }

  return oauth;
}

export function getOAuthConsentURL(oauth: Auth.OAuth2Client, data: Record<string, any> = {}) {
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
  const url = oauth.generateAuthUrl({
    scope: scopes,
    state: JSON.stringify(data),
    access_type: "offline",
    prompt: 'consent'
  })
  return url;
}

export async function verify(oauth: Auth.OAuth2Client, ev: RequestEvent) {
  async function getPayload() {
    if (!!!oauth.credentials.id_token) return undefined;
    try {
      let ticket = await oauth.verifyIdToken({
        idToken: oauth.credentials.id_token,
        audience: OAUTH_CLIENT_ID,
      })
      return ticket.getPayload()
    } catch (e) {
      return undefined;
    }
  }

  try {
    let payload = await getPayload();
    if (!!!payload && oauth.credentials.refresh_token) {
      let { credentials } = await oauth.refreshAccessToken()
      console.log('new credentials', credentials)
      if (!credentials.refresh_token) credentials.refresh_token = oauth.credentials.refresh_token;
      oauth.setCredentials(credentials)
      ev.cookies.set(OAUTH_CREDENTIALS_COOKIE, JSON.stringify(credentials), {
        path: "/",
        expires: new Date(new Date().getFullYear(), 0)
      })
      payload = await getPayload();
    };
    return payload;
  } catch (e) {
    console.log(e, 'verify')
    return undefined;
  }
}

export async function getInfo(oauth: Auth.OAuth2Client) {
  if (!!!oauth.credentials.access_token) return null;

  let api = google.people({
    version: "v1",
    auth: oauth,
  })

  let user = await api.people.get({
    auth: auth,
    key: GOOGLE_API_KEY,
    resourceName: "people/me"
  })

  return user;
}
