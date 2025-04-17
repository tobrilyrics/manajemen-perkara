import {
  BELUM_LIMPAH_SHEET,
  BELUM_LIMPAH_SHEET_ID,
  JAKSA_SHEET,
} from "$env/static/private";
import {
  appendRow,
  deleteRow,
  getAsalPerkara,
  getSheetRows,
  getTempatDitahan,
  query,
  transformBelumLimpahRow,
  transformJaksaRow,
  updateRow,
} from "$lib/server/sheets-api";
import { filterNullish, customDateToString } from "$lib/utils";
import type { Actions, RequestEvent } from "./$types";
import { superValidate } from "sveltekit-superforms/server";
import { perkaraSchema } from "./schema";
import { fail } from "@sveltejs/kit";

export async function load(ev: RequestEvent) {
  let jaksaRows = await getSheetRows(ev.locals.oauth, `${JAKSA_SHEET}`);
  let listJaksa = jaksaRows
    .slice(1) // skip column header
    .map((e) => transformJaksaRow(e))
    .filter(filterNullish);

  let rows = await getSheetRows(ev.locals.oauth, `${BELUM_LIMPAH_SHEET}`);
  let listBelumLimpah = rows
    .slice(2)
    .map((e) => {
      let row = transformBelumLimpahRow(e, listJaksa);
      return row;
    })
    .filter(filterNullish)

  return {
    asalPerkara: await getAsalPerkara(ev.locals.oauth),
    tempatDitahan: await getTempatDitahan(ev.locals.oauth),
    listBelumLimpah,
    listJaksa,
    perkaraForm: await superValidate(perkaraSchema, { id: "tambah" }),
  };
}

export const actions: Actions = {
  tambah: async (ev) => {
    let form = await superValidate(ev.request, perkaraSchema, { id: "tambah" });
    let data = {
      form,
      tambah: {
        success: false,
        message: "Gagal",
      },
    };

    if (!!!ev.locals.payload) {
      data.tambah.message = "Please Login";
      return fail(400, data);
    }

    let [t7start, t7end, t6start, t6end] = transformDate(
      form.data.t7start ?? "-",
      form.data.t7end ?? "-",
      form.data.t6start ?? "-",
      form.data.t6end ?? "-"
    );

    if (form.valid) {
      try {
        const queryS = `=MATCH("${form.data.pdm}"; '${BELUM_LIMPAH_SHEET}'!B2:B; false)`
        let rowno = await query(queryS, ev.locals.oauth);
        console.log(queryS)
        if (rowno) {
          data.tambah.message = `PDM: ${form.data.pdm} Sudah Ada`;
        } else {
          await appendRow(
            (rowno) => [
              {
                type: "formula",
                value: "=ROW() - 2"
              },
              {
                type: "string",
                value: form.data.pdm,
              },
              {
                type: "string",
                value: transformDatetoTahap(t7start, t7end),
              },
              {
                type: "string",
                value: transformDatetoTahap(t6start, t6end),
              },
              {
                type: "string",
                value: form.data.ditahan,
              },
              {
                type: "string",
                value: form.data.terdakwa,
              },
              {
                type: "formula",
                value: `=JOIN(" / "; MAP(SPLIT(M${rowno}; ","); LAMBDA(a; VLOOKUP(TRIM(a); Jaksa!B:E; 2; false))))`,
              },
              {
                type: "string",
                value: form.data.asalPerkara,
              },
              {
                type: "string",
                value: form.data.pasal ?? "",
              },
              {
                type: "string",
                value: form.data.barangBukti === "ada" ? "v" : "",
              },
              {
                type: "string",
                value: form.data.barangBukti === "tidakAda" ? "v" : "",
              },
              {
                type: "string",
                value: form.data.barangBukti === "dititip" ? "v" : "",
              },
              {
                type: "string",
                value: form.data.jpu.join(",")
              }
            ],
            parseInt(BELUM_LIMPAH_SHEET_ID),
            ev.locals.oauth,
            BELUM_LIMPAH_SHEET,
          );
          data.tambah.success = true;
          data.tambah.message = "Sukses";
        }
      } catch (error) {
        console.log(error)
        data.tambah.message = `${error}`;
      }
    } else {
      console.error(form.errors)
      data.tambah.message = "Invalid Input " + form.errors._errors?.join(" | ");
    }

    if (!data.tambah.success) return fail(400, data);
    return data;
  },

  hapus: async (ev) => {
    let row = (await ev.request.formData()).get("pdm")?.toString();
    let data = {
      hapus: {
        success: false,
        message: "Gagal",
      },
    };

    if (!!!ev.locals.payload) {
      data.hapus.message = "Please Login";
      console.log(data);
      return fail(400, data);
    }

    if (row) {
      try {
        let queryString = `=MATCH("${row}"; '${BELUM_LIMPAH_SHEET}'!B:B; false)`;
        let rowno = await query(queryString, ev.locals.oauth);
        if (rowno && !isNaN(parseInt(rowno))) {
          await deleteRow(
            parseInt(rowno),
            parseInt(BELUM_LIMPAH_SHEET_ID),
            ev.locals.oauth
          );
          data.hapus.success = true;
          data.hapus.message = "Sukses";
        } else data.hapus.message = "Perkara Tidak Ditemukan";
      } catch (e) {
        console.log(e);
        data.hapus.message = String(e);
      }
    } else data.hapus.message = `PDM Required`;

    if (!data.hapus.success) return fail(400, data);
    return data;
  },

  edit: async (ev) => {
    let form = await superValidate(ev.request, perkaraSchema, { id: "edit" });
    let data = {
      form,
      edit: {
        success: false,
        message: "Gagal",
      },
    };

    if (!!!ev.locals.payload) {
      data.edit.message = "Please Login";
      console.log(data);
      return fail(400, data);
    }

    let [t7start, t7end, t6start, t6end] = transformDate(
      form.data.t7start ?? "-",
      form.data.t7end ?? "-",
      form.data.t6start ?? "-",
      form.data.t6end ?? "-"
    );

    if (form.valid) {
      try {
        let rowno = await query(`=MATCH("${form.data.pdm}"; '${BELUM_LIMPAH_SHEET}'!B:B; false)`, ev.locals.oauth);
        console.log(rowno)
        if (rowno && !isNaN(parseInt(rowno))) {
          await updateRow([
            {
              type: "formula",
              value: "=ROW() - 2",
            },
            {
              type: "string",
              value: form.data.pdm,
            },
            {
              type: "string",
              value: transformDatetoTahap(t7start, t7end),
            },
            {
              type: "string",
              value: transformDatetoTahap(t6start, t6end),
            },
            {
              type: "string",
              value: form.data.ditahan,
            },
            {
              type: "string",
              value: form.data.terdakwa,
            },
            {
              type: "formula",
              value: `=JOIN(" / "; MAP(SPLIT(M${rowno}; ","); LAMBDA(a; VLOOKUP(a; Jaksa!B:E; 2; false))))`,
            },
            {
              type: "string",
              value: form.data.asalPerkara,
            },
            {
              type: "string",
              value: form.data.pasal ?? "",
            },
            {
              type: "string",
              value: form.data.barangBukti === "ada" ? "v" : "",
            },
            {
              type: "string",
              value: form.data.barangBukti === "tidakAda" ? "v" : "",
            },
            {
              type: "string",
              value: form.data.barangBukti === "dititip" ? "v" : "",
            },
            {
              type: "string",
              value: form.data.jpu.join(",")
            }
          ], parseInt(rowno), parseInt(BELUM_LIMPAH_SHEET_ID), ev.locals.oauth)
          data.edit.success = true
          data.edit.message = "Sukses"
        } else data.edit.message = "Data Not Found";
      } catch (e) {
        console.error(e)
        data.edit.message = String(e)
      }
    } else data.edit.message = "Invalid Input " + form.errors._errors?.join(" | ");

    if (!data.edit.success) return fail(400, data);

    return data
  },
};

function transformDatetoTahap(start?: Date | null, end?: Date | null) {
  if (!!!start || !!!end) return "-";
  return `${customDateToString(start)} s.d ${customDateToString(end)}`
}

function transformDate(...args: string[]) {
  return args.map((e) => {
    if (isNaN(Date.parse(e))) return null;
    return new Date(e);
  });
}
