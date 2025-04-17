import { OAUTH_CREDENTIALS_COOKIE } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function GET(ev: RequestEvent){
  ev.cookies.delete(OAUTH_CREDENTIALS_COOKIE, {path: "/"})
  throw redirect(302, "/");
}
