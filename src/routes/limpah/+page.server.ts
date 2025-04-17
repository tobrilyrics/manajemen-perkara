import type { Actions, RequestEvent } from "./$types";
import { tambahSchema } from "./schema";
import { appendRow, deleteRow, findSheet, getRowAt, getSheetRows, query, transformBelumLimpahRow, transformLimpahRow } from "$lib/server/sheets-api";
import { BELUM_LIMPAH_SHEET, BELUM_LIMPAH_SHEET_ID } from "$env/static/private";
import { fail } from "@sveltejs/kit";
import { parseTime } from "$lib/utils";
import { PUBLIC_LIMPAH_SHEET } from "$env/static/public";

export async function load(ev: RequestEvent) {
  let sheetName = ev.url.searchParams.get('sheet') ?? PUBLIC_LIMPAH_SHEET.split(',').splice(-1)[0]
  let { sheet } = await findSheet(sheetName)

  let rows = sheet ? await getSheetRows(ev.locals.oauth, sheetName) : [];
  let limpahList = rows.slice(2).map(transformLimpahRow)

  return {
    message: sheet ? null : `Sheet: ${sheetName} Not Found`,
    limpahList,
    sheetName,
  }
}

export const actions: Actions = {
  tambah: async ev => {
    let data = tambahSchema.safeParse(await ev.request.json())
    let sheetName = PUBLIC_LIMPAH_SHEET.split(',').slice(-1)[0]
    if (!data.success) return fail(403, { data })

    let row = parseInt(await query(`=MATCH("${data.data.pdm}"; '${BELUM_LIMPAH_SHEET}'!B:B; false)`, ev.locals.oauth) ?? "")
    if (isNaN(row)) return fail(403, { data, message: `${data.data.pdm} Not Found` })

    let values = await getRowAt(row, BELUM_LIMPAH_SHEET, ev.locals.oauth)
    if (!values) return fail(403, { data, message: "Gagal" })

    let belumLimpah = transformBelumLimpahRow(values, [])
    let { sheet } = await findSheet(sheetName);
    if (!sheet) return fail(403, { data, message: `Sheet: ${sheetName} Not Found` });
    if (!sheet.properties?.sheetId) return fail(403, { data, message: `Sheet: ${sheetName} Not Found` });

    let sheetId = sheet.properties.sheetId;
    console.log(parseTime(data.data.tanggal))
    await appendRow([
      null, {
        type: 'string',
        value: parseTanggal(data.data.tanggal),
      }, {
        type: 'string',
        value: parseTime(data.data.tanggal),
      }, {
        type: 'string',
        value: belumLimpah.terdakwa ?? "-",
      }, {
        type: 'string',
        value: values[6]
      }, {
        type: 'string',
        value: belumLimpah.asalPerkara,
      }, {
        type: 'string',
        value: belumLimpah.pasal
      }, {
        type: 'string',
        value: belumLimpah.barangBukti === 'ada' ? 'v' : '',
      }, {
        type: 'string',
        value: belumLimpah.barangBukti === 'tidakAda' ? 'v' : '',
      }, {
        type: 'string',
        value: belumLimpah.barangBukti === 'dititip' ? 'v' : '',
      }, {
        type: 'string',
        value: data.data.cms ? 'v' : '',
      }, {
        type: 'string',
        value: data.data.terkirim ? 'v' : '',
      }, {
        type: 'string',
        value: data.data.eBerpadu ? 'v' : '',
      }
    ], sheetId, ev.locals.oauth)
    await deleteRow(row, parseInt(BELUM_LIMPAH_SHEET_ID), ev.locals.oauth);

    return { data, message: 'Sukses' }
  }
}

function parseTanggal(date: Date) {
  let day = Intl.DateTimeFormat('id', { weekday: 'long' }).format(date)
  return `${day}, ${date.toLocaleDateString('id')}`
}
