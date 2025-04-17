import { ASAL_PERKARA_SHEET, GOOGLE_API_KEY, SPREADSHEET_ID, TEMPAT_DITAHAN_SHEET, TEMP_SHEET } from "$env/static/private";
import { filterNullish, getErrorMessage } from "$lib/utils";
import { Auth, google } from "googleapis";

const pstr = (v: string | undefined) => !!v ? v : undefined;

export type JaksaRowType = {
  id: string;
  nama: string;
  password?: string;
  cabang?: string;
};

export type BelumLimpahRowType = {
  pdm?: string;
  t7?: {
    start: Date;
    end: Date;
  };
  t6?: {
    start: Date;
    end: Date;
  };
  ditahan?: string;
  terdakwa?: string;
  jpu: JaksaRowType[];
  asalPerkara?: string;
  pasal?: string;
  barangBukti?: "ada" | "tidakAda" | "dititip";
};

const defaultBorderStyle = {
  colorStyle: {
    rgbColor: {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1,
    },
  },
  style: "SOLID",
  width: 2,
};

function getSheetsApi(_?: Auth.OAuth2Client) {
  return google.sheets({
    version: "v4",
  });
}

export async function getSheetRows(oauth: Auth.OAuth2Client, range: string) {
  try {
    let sheetsApi = getSheetsApi(oauth);
    let res = await sheetsApi.spreadsheets.values.get({
      key: GOOGLE_API_KEY,
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    let rows: string[][] = res.data.values ?? [];
    return rows;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getAsalPerkara(auth: Auth.OAuth2Client) {
  let rows = await getSheetRows(auth, ASAL_PERKARA_SHEET)
  let data = rows.slice(1).map(e => pstr(e[1])).filter(filterNullish)
  return data
}

export async function getTempatDitahan(auth: Auth.OAuth2Client) {
  let rows = await getSheetRows(auth, TEMPAT_DITAHAN_SHEET)
  let data = rows.slice(1).map(e => pstr(e[1])).filter(filterNullish)
  return data
}

export function transformBelumLimpahRow(row: (string | undefined)[], listJaksa: JaksaRowType[]) {
  let pdm = pstr(row[1]);
  let t7 = parseTahap(pstr(row[2]));
  let t6 = parseTahap(pstr(row[3]));
  let ditahan = pstr(row[4]);
  let terdakwa = pstr(row[5]);
  let asalPerkara = pstr(row[7]);
  let pasal = pstr(row[8]);
  let bb = parseBB(row[9], row[10], row[11]);
  let jpu = parseJaksa(pstr(row[12]), listJaksa);
  let rowData: BelumLimpahRowType = {
    pdm,
    t7,
    t6,
    ditahan,
    terdakwa,
    jpu,
    asalPerkara,
    pasal,
    barangBukti: bb,
  };
  return rowData;
}

export function transformJaksaRow(row: string[], includePassword = false) {
  let id = row[1];
  let nama = row[2];
  let password = includePassword ? row[3] : undefined;
  let cabang = row[4];

  if (!!!id || !!!nama || !!!cabang) return null;

  let data: JaksaRowType = {
    id, nama, password, cabang,
  };
  return data;
}

function parseBB(ada: string | undefined, tidakAda: string | undefined, dititip: string | undefined): BelumLimpahRowType["barangBukti"] {
  let bb = {
    ada: !!ada,
    tidakAda: !!tidakAda,
    dititip: !!dititip,
  };
  if (bb.ada) return "ada";
  if (bb.dititip) return "dititip";
  return "tidakAda";
}

function parseJaksa(value: string | undefined, listJaksa: JaksaRowType[]) {
  if (!!!value) return [];
  let list = value.split(",")
  let listJPU = listJaksa.filter(e => list.includes(e.id))
  return listJPU
}

function parseTahap(value: string | undefined) {
  if (!!!value || !value.length) return undefined;
  let splitTrimmed = value.split("s.d").map((e) => e.trim());
  if (splitTrimmed.length != 2) return undefined;
  let [start, end] = splitTrimmed.map((e) => {
    let nums = e.split("-").map((e) => e.trim());
    if (nums.length != 3) return null;
    let [date, month, year] = nums.map((e) => parseInt(e));
    if (isNaN(date) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, date);
  });
  if (start === null || end === null) return undefined;
  let data: BelumLimpahRowType["t6"] | BelumLimpahRowType["t7"] = {
    start,
    end,
  };
  return data;
}

type CellValue = {
  type: "string" | "formula";
  value: string;
} | null;

export async function appendRow(
  rawRow: CellValue[] | ((rowno: number) => CellValue[]),
  sheetId: number,
  oauth: Auth.OAuth2Client,
  sheetName?: string,
) {
  let sheetsApi = getSheetsApi(oauth);

  let row: CellValue[] = [];
  if (typeof rawRow === "function") {
    if (sheetName === null) throw Error("sheetName is Null when required");
    let rowno = (await sheetsApi.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
      auth: oauth,
      key: GOOGLE_API_KEY,
    })).data.values?.length ?? 0
    row = rawRow(rowno + 1)
  } else {
    row = rawRow
  }

  let rowValues: ({ formulaValue: string } | { stringValue: string } | {})[] =
    row.map((e) => {
      if (!!!e) return {};
      if (e.type === "formula")
        return {
          formulaValue: e.value,
        };
      return {
        stringValue: e.value,
      };
    });

  let res = await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    auth: oauth,
    requestBody: {
      requests: [
        {
          appendCells: {
            sheetId,
            fields: "*",
            rows: [
              {
                values: rowValues.map((e) => ({
                  userEnteredValue: e,
                  userEnteredFormat: {
                    borders: {
                      top: defaultBorderStyle,
                      bottom: defaultBorderStyle,
                      left: defaultBorderStyle,
                      right: defaultBorderStyle,
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE",
                    wrapStrategy: "WRAP",
                  },
                })),
              },
            ],
          },
        },
      ],
    },
  });

  return res.data;
}

export async function deleteRow(
  row: number,
  sheetId: number,
  oauth: Auth.OAuth2Client
) {
  let sheetsApi = getSheetsApi(oauth);

  sheetsApi.spreadsheets.batchUpdate({
    auth: oauth,
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              dimension: "ROWS",
              sheetId,
              startIndex: row - 1,
              endIndex: row,
            },
          },
        },
      ],
    },
  });
}

export async function updateRow(
  row: CellValue[],
  rowno: number,
  sheetId: number,
  oauth: Auth.OAuth2Client,
) {
  let sheetsApi = getSheetsApi(oauth);

  let rowValues: ({ formulaValue: string } | { stringValue: string } | {})[] =
    row.map((e) => {
      if (!!!e) return {};
      if (e.type === "formula")
        return {
          formulaValue: e.value,
        };
      return {
        stringValue: e.value,
      };
    });

  sheetsApi.spreadsheets.batchUpdate({
    auth: oauth,
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      includeSpreadsheetInResponse: true,
      requests: [
        {
          updateCells: {
            fields: "*",
            rows: [
              {
                values: rowValues.map((e) => ({
                  userEnteredValue: e,
                  userEnteredFormat: {
                    borders: {
                      top: defaultBorderStyle,
                      bottom: defaultBorderStyle,
                      left: defaultBorderStyle,
                      right: defaultBorderStyle,
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE",
                    wrapStrategy: "WRAP",
                  },
                })),
              },
            ],
            range: {
              sheetId,
              startRowIndex: rowno - 1,
              endRowIndex: rowno,
            },
          },
        },
      ],
    },
  });
}

export async function query(search: string, oauth: Auth.OAuth2Client) {
  let sheetsApi = getSheetsApi();

  let tempSheet = await sheetsApi.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    auth: oauth,
    key: GOOGLE_API_KEY,
    range: `${TEMP_SHEET}!A1:A1`,
    valueInputOption: "USER_ENTERED",
    includeValuesInResponse: true,
    requestBody: {
      range: `${TEMP_SHEET}!A1:A1`,
      majorDimension: "ROWS",
      values: [[search]]
    }
  })
  let values = tempSheet.data.updatedData?.values
  if (values) {
    try {
      let data = values[0][0] as string
      if (data.startsWith("#")) return null;
      return data;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getRowAt(row: number, sheet: string, auth: Auth.OAuth2Client) {
  let sheetsApi = getSheetsApi()
  let values = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheet}'!${row}:${row}`,
    auth,
  })

  let rows = values.data.values
  if (rows && rows.length > 0) return rows[0];
  return null;
}

export async function findSheet(sheetName: string) {
  let sheetsApi = getSheetsApi()
  try {
    let sp = await sheetsApi.spreadsheets.get({
      key: GOOGLE_API_KEY,
      spreadsheetId: SPREADSHEET_ID,
    })
    let sheets = sp.data.sheets;
    let filter = (sheets ?? []).filter(e => e.properties?.title === sheetName);
    return {
      sheet: filter.length > 0 ? filter[0] : null,
      error: null,
    }
  } catch (e) {
    return {
      sheet: null,
      error: getErrorMessage(e)
    }
  }
}

export function transformLimpahRow(row: string[]) {
  let no = row[0];
  let tanggal = row[1];
  let pukul = row[2];
  let terdakwa = row[3];
  let jpu = row[4];
  let asalPerkara = row[5];
  let pasal = row[6];
  let bbAda = !!row[7];
  let bbTidakAda = !!row[8];
  let bbDititip = !!row[9]
  let cms = !!row[10];
  let berkasPn = !!row[11];
  let eBerpadu = !!row[12];
  return {
    no,
    tanggal,
    pukul,
    terdakwa,
    jpu,
    asalPerkara,
    pasal,
    bbAda,
    bbTidakAda,
    bbDititip,
    cms,
    berkasPn,
    eBerpadu,
  }
}
