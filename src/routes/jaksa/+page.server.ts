import { JAKSA_SHEET, JAKSA_SHEET_ID } from "$env/static/private";
import {
  appendRow,
  deleteRow,
  query,
  getSheetRows,
  transformJaksaRow,
  updateRow,
} from "$lib/server/sheets-api";
import { superValidate } from "sveltekit-superforms/server";
import type { Actions, RequestEvent } from "./$types";
import { jaksaEditSchema, jaksaSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { filterNullish } from "$lib/utils";

export async function load(ev: RequestEvent) {
  let rows = await getSheetRows(ev.locals.oauth, `${JAKSA_SHEET}`);
  let listJaksa = rows
    .slice(1) //skip column header
    .map((e) => transformJaksaRow(e))
    .filter(filterNullish);

  return {
    listJaksa,
    jaksaForm: await superValidate(jaksaSchema),
  };
}

export const actions: Actions = {
  tambah: async (ev) => {
    let form = await superValidate(ev.request, jaksaSchema);
    let data = {
      form,
      tambah: {
        success: false,
        message: "Gagal",
      },
    };

    if (!!!ev.locals.payload) {
      data.tambah.message = "Please Login";
      console.log(data);
      return fail(400, data);
    }

    if (form.valid) {
      try {
        await appendRow(
          [
            {
              type: "formula",
              value: "=ROW() - 1",
            },
            {
              type: "string",
              value: form.data.id,
            },
            {
              type: "string",
              value: form.data.nama,
            },
            {
              type: "string",
              value: form.data.password,
            },
            {
              type: "string",
              value: form.data.cabang,
            },
          ],
          parseInt(JAKSA_SHEET_ID),
          ev.locals.oauth
        );
        data.tambah.success = true;
        data.tambah.message = "Sukses";
      } catch (error) {
        console.error(error)
        data.tambah.message = `${error}`;
      }
    } else data.tambah.message = "Invalid Input";

    if (!data.tambah.success) return fail(400, data);
    return data;
  },

  hapus: async (ev) => {
    let id = (await ev.request.formData()).get("id")?.toString();
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

    if (id) {
      try {
        let rowNo = await query(`=MATCH("${id}";'${JAKSA_SHEET}'!B:B; false)`, ev.locals.oauth)
        if (rowNo && !isNaN(parseInt(rowNo))) {
          await deleteRow(
            parseInt(rowNo),
            parseInt(JAKSA_SHEET_ID),
            ev.locals.oauth
          );
          data.hapus.success = true;
          data.hapus.message = "Sukses";
        } else data.hapus.message = "Jaksa Not Found";
      } catch (e) {
        console.error(e)
        data.hapus.message = String(e);
      }
    } else data.hapus.message = "Provide Jaksa Id";

    if (!data.hapus.success) return fail(400, data);
    return data;
  },

  edit: async (ev) => {
    let form = await superValidate(ev.request, jaksaEditSchema);
    let data = {
      form,
      edit: {
        success: false,
        message: "Gagal",
      },
    };

    console.log(form)

    if (!!!ev.locals.payload) {
      data.edit.message = "Please Login";
      console.log(data);
      return fail(400, data);
    }

    if (form.valid) {
      try {
        let queryStr = `=MATCH("${form.data.id}";'${JAKSA_SHEET}'!B:B; false)`;
        let rowNo = await query(queryStr, ev.locals.oauth)
        let password = await query(`='${JAKSA_SHEET}'!D${rowNo}`, ev.locals.oauth)
        if (rowNo && !isNaN(parseInt(rowNo))) {
          await updateRow(
            [
              {
                type: "formula",
                value: "=ROW()-1",
              },
              {
                type: "string",
                value: form.data.id,
              },
              {
                type: "string",
                value: form.data.nama,
              },
              {
                type: "string",
                value: password ?? form.data.nama.at(0) + "1234",
              },
              {
                type: "string",
                value: form.data.cabang,
              },
            ],
            parseInt(rowNo),
            parseInt(JAKSA_SHEET_ID),
            ev.locals.oauth
          );
          data.edit.success = true;
        } else data.edit.message = "Jaksa Not Found";
      } catch (error) {
        console.log(error);
        data.edit.message = String(error)
      }
    } else data.edit.message = "Invalid Input";

    if (!data.edit.success) return fail(400, data);
    return data;
  },
};
