import { json, type RequestHandler } from "@sveltejs/kit"
import { getSheetRows, transformJaksaRow } from "$lib/server/sheets-api"
import { JAKSA_SHEET } from "$env/static/private";
import { filterNullish } from "$lib/utils";

export const GET: RequestHandler = async (ev) => {
  let rows = await getSheetRows(ev.locals.oauth, `${JAKSA_SHEET}`);
  let listJaksa = rows
    .slice(1)
    .map((e) => transformJaksaRow(e))
    .filter(filterNullish);

  return json({
    listJaksa,
  });
};
