import type { ZodSchema } from "zod";
import { toastPromise } from "./utils";
import { applyAction, enhance } from "$app/forms";
import { tick } from "svelte";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type FormNotificationProps<
  Schema extends ZodSchema,
  ActionDataType extends Record<string, any>|null
> = {
  desc?: string;
  onSuccess?:
    | ((data: ActionDataType) => string | null | undefined)
    | string
    | null;
  onError?: ((data: ActionDataType) => string | null | undefined) | string | null;
  schema?: Schema;
  updateFirst?: boolean;
  loading?: string;
};
export function formNotification<
  Schema extends ZodSchema,
  ActionDataType extends Record<string, any>|null
>(
  el: HTMLFormElement,
  opts: FormNotificationProps<Schema, ActionDataType> = {}
) {
  let updateFirst = opts.updateFirst ?? true;
  let onSuccess = opts.onSuccess ?? "Sukses";
  let onError = opts.onError ?? "Gagal";

  enhance(el, () => {
    let { resolve, reject } = toastPromise({
      description: opts.desc,
      loading: opts.loading,
      success(arg0: string) {
        return arg0;
      },
      error(arg0) {
        return `${arg0}`;
      },
    });

    return async ({ result, update }) => {
      if (updateFirst) {
        await update();
        await applyAction(result);
      }
      if (result.type === "success") {
        let data = result.data as ActionDataType;
        let msg =
          typeof onSuccess === "string"
            ? onSuccess
            : onSuccess(data) ?? "Sukses";
        resolve(msg);
      } else if (result.type === "failure") {
        let data = result.data as ActionDataType
        let msg = typeof onError === "string" ? onError : onError(data) ?? "Gagal";
        reject(msg);
      }
      if (!updateFirst) {
        await applyAction(result);
        await update();
      }
    };
  });
}
