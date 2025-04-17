import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { type JaksaRowType, getSheetRows, transformJaksaRow } from "$lib/server/sheets-api";
import { JAKSA_SHEET } from "$env/static/private";
import { filterNullish } from "$lib/utils";

export const POST: RequestHandler = async ev => {
  let form = await ev.request.formData()
  let user: JaksaRowType | null = null

  let id = form.get("id")?.toString()
  let password = form.get("password")?.toString()
  let secret = form.get("secret")?.toString()

  console.log(id, password, secret);

  if (id && password) {
    let listJaksa = (await getSheetRows(ev.locals.oauth, JAKSA_SHEET)).map(e => transformJaksaRow(e, true)).filter(filterNullish)
    let match = listJaksa.filter(e => e.id === id && e.password === password)
    if (match.length > 0) {
      user = match[0]
    }
  }

  return json({
    user,
  }, {
    status: secret === "pidum_gg" ? (user !== null ? 200 : 401) : 404,
  });
}
