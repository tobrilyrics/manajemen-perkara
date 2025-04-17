import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { toast } from "svelte-sonner";
import type { transformBelumLimpahRow } from "./server/sheets-api";
import { writable } from "svelte/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

type ToastPromiseProp<T> = {
  loading?: string;
  success?: string | ((arg0: T) => string);
  error?: string | ((arg0: any) => string);
  description?: string;
};
export function toastPromise<T extends Object>(prop: ToastPromiseProp<T> = {}) {
  let resolve = (_: T) => { };
  let reject = (_: any) => { };

  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  toast.promise(promise, {
    loading: prop.loading ?? "Loading..",
    success: prop.success ?? ((e) => `${e}`),
    error: prop.error ?? ((e) => `${e}`),
    position: "bottom-right",
    description: prop.description,
  });

  return { resolve, reject };
}

export function transformBarangBuktiDisplay(
  bb: NonNullable<ReturnType<typeof transformBelumLimpahRow>>["barangBukti"]
): string {
  if (bb === "ada") return "Ada";
  if (bb === "tidakAda") return "Tidak Ada";
  if (bb === "dititip") return "Dititip";
  throw Error();
}

export function filterNullish<T>(e: T | null | undefined): e is T {
  return e !== null && e !== undefined;
}

export function customDateToString(date: Date | undefined | null) {
  if (!!!date) return null;
  let year = new Intl.DateTimeFormat('id', { year: "numeric" }).format(date)
  let month = new Intl.DateTimeFormat('id', { month: "2-digit" }).format(date)
  let day = new Intl.DateTimeFormat('id', { day: "2-digit" }).format(date)
  return `${day}-${month}-${year}`
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Unwrap<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : T;

export function dateInputProxy() {
  let date = writable(new Date());
  let input = writable("")
  date.subscribe(e => {
    input.set(parseDateToInputValue(e) ?? "")
  })
  input.subscribe(e => {
    date.set(new Date(e))
  })
  return { date, input }
}

export function parseDateToInputValue(d?: Date) {
  let dd = d
    ?.toLocaleDateString("id", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/");
  if (dd) {
    let [date, month, year] = dd;
    return `${year}-${month}-${date}`;
  }
  return undefined;
}

export function parseTime(date: Date, sep = ".") {
  let min = date.getMinutes().toString()
  let hour = date.getHours().toString();
  return `${hour.length < 2 ? 0 : ''}${hour}${sep}${min.length < 2 ? 0 : ''}${min}`
}

export function parseDateToInputDatetimeValue(date?: Date) {
  if (!date) return '';
  let YYYY = Intl.DateTimeFormat('id', { year: 'numeric' }).format(date)
  let MM = Intl.DateTimeFormat('id', { month: '2-digit' }).format(date)
  let DD = Intl.DateTimeFormat('id', { day: '2-digit' }).format(date)
  let hh = Intl.DateTimeFormat('id', { hour: '2-digit' }).format(date)
  let mm = Intl.DateTimeFormat('id', { minute: '2-digit' }).format(date)
  let res = `${YYYY}-${MM}-${DD}T${hh}:${mm.length !== 2 ? '0' : ''}${mm}`
  console.log(res)
  return res;
}

export function getErrorMessage(e: any) {
  if (e instanceof Error) return e.message;
  return String(e);
}
