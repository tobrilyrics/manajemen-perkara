import { BELUM_LIMPAH_SHEET, JAKSA_SHEET } from "$env/static/private";
import { getSheetRows, transformBelumLimpahRow, transformJaksaRow } from "$lib/server/sheets-api";
import { filterNullish } from "$lib/utils";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (ev) => {
  let secret = (await ev.request.formData()).get("secret")?.toString()

  if (secret !== "pidum_gg") return json({ listBelumLimpah: [] }, { status: 404 })

  let listJaksa = (await getSheetRows(ev.locals.oauth, JAKSA_SHEET))
    .slice(1)
    .map(e => transformJaksaRow(e))
    .filter(filterNullish);

  let rows = await getSheetRows(ev.locals.oauth, `${BELUM_LIMPAH_SHEET}`);
  let listBelumLimpah = rows
    .slice(2)
    .map((e) => transformBelumLimpahRow(e, listJaksa))
    .filter(filterNullish);

  return json({
    listBelumLimpah,
  });
};
