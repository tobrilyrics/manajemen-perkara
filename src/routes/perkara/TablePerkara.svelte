<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import { Dialog, DialogContent } from "$lib/components/ui/dialog";
  import type {
    JaksaRowType,
    transformBelumLimpahRow,
  } from "$lib/server/sheets-api";
  import { MoreVertical, Pencil, Trash } from "lucide-svelte";
  import { formNotification } from "$lib/actions";
  import * as Select from "$lib/components/ui/select";
  import { Label } from "$lib/components/ui/label";
  import {
    customDateToString,
    filterNullish,
    toastPromise,
    transformBarangBuktiDisplay,
    type Unwrap,
    parseDateToInputValue,
    parseDateToInputDatetimeValue,
  } from "$lib/utils";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { ActionData, PageData } from "./$types";
  import type { ActionData as ActionDataLimpah } from "../limpah/$types";
  import { onMount, tick } from "svelte";
  import { actions } from "$lib/components/Navbar.svelte";
  import { PUBLIC_LIMPAH_SHEET } from "$env/static/public";
  import { ChevronDown, ChevronUp } from "radix-icons-svelte";

  export let listBelumLimpah: NonNullable<
    Unwrap<ReturnType<typeof transformBelumLimpahRow>>
  >[] = [];
  export let listJaksa: JaksaRowType[] = [];
  export let openForm: boolean;
  export let pageData: PageData;

  let currentData: Unwrap<ReturnType<typeof transformBelumLimpahRow>> | null =
    null;
  let checkAll = false;
  let showLimpahForm = false;
  let shortPDM: "ASC" | "DESC" = "ASC";

  $: limpahList = showLimpahForm
    ? listBelumLimpah
        .filter((e) => {
          if (!e.pdm) return false;
          return allCheckedPDM().includes(e.pdm);
        })
        .map((e) => {
          let date = new Date();
          return {
            tanggal: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes() > 30 ? 60 : 0,
              0,
              1,
            ),
            cms: false,
            terkirim: false,
            eBerpadu: false,
            ...e,
          };
        })
    : [];

  function getPDMNum(pdm: string) {
    let m = pdm.match(/\d+/);
    return parseInt(m ? m[0] : "");
  }

  function toSortedPDM(shortType: typeof shortPDM) {
    shortPDM = shortType;
    listBelumLimpah = listBelumLimpah.toSorted((a, b) => {
      if (!a.pdm || !b.pdm) return 1;

      const aNum = getPDMNum(a.pdm);
      const bNum = getPDMNum(b.pdm);
      if (isNaN(aNum) || isNaN(bNum)) return 1;

      if (shortType == "DESC") return aNum - bNum;
      else return bNum - aNum;
    });
  }

  function allCheckedPDM() {
    let el = [
      ...document.querySelectorAll(".checkItem"),
    ] as HTMLButtonElement[];
    let checked = el.filter((e) => e.dataset["state"] === "checked");
    let pdm = checked.map((e) => e.dataset["pdm"]).filter(filterNullish);
    return pdm;
  }

  async function uploadLimpah(list: typeof limpahList) {
    for (const l of list) {
      let msg = toastPromise({ loading: `Uploading: ${l.pdm}...` });
      let res = await fetch("/limpah?/tambah", {
        method: "POST",
        body: JSON.stringify({
          tanggal: l.tanggal,
          pdm: l.pdm,
          cms: l.cms,
          terkirim: l.terkirim,
          eBerpadu: l.eBerpadu,
        }),
      });
      let result = deserialize<
        NonNullable<ActionDataLimpah>,
        NonNullable<ActionDataLimpah>
      >(await res.text());
      await invalidateAll();
      await tick();
      limpahList = list;
      if (result.type === "success") {
        msg.resolve(result.data?.message ?? "Sukses");
      } else if (result.type === "failure")
        msg.reject(result.data?.message ?? "Gagal");
      else if (result.type === "error") msg.reject(result.error ?? "Gagal");
      else location.assign(result.location);
    }
    checkAll = false;
    showLimpahForm = false;
  }

  async function hapusBulk() {
    let { resolve, reject } = toastPromise();
    let pdm = allCheckedPDM();
    if (pdm.length < 1) reject("Tidak Ada Yg Dihapus");
    let deleted = 0;

    for (let e of pdm) {
      let formData = new FormData();
      formData.set("pdm", e);
      let res = await fetch("?/hapus", {
        method: "POST",
        body: formData,
      });
      let result = deserialize(await res.text());
      await applyAction(result);
      await invalidateAll();
      if (result.type === "failure") {
        let data = result.data as ActionData;
        let msg = data?.hapus?.message;
        reject("Gagal Hapus Data: " + msg);
        break;
      } else {
        deleted++;
      }
      resolve("Sukses");
    }

    resolve(`Berhasil Hapus ${deleted} data`);
  }

  actions.update((prev) => {
    prev = [
      {
        variant: "destructive",
        label: "Hapus",
        onClick: hapusBulk,
      },
      {
        variant: "default",
        label: "Limpah",
        onClick: () => {
          if (!pageData.user) {
            location.assign("/oauth");
            return;
          }
          showLimpahForm = true;
        },
      },
      {
        variant: "default",
        label: "Tambah",
        onClick: () => {
          if (!pageData.user) {
            location.assign("/oauth");
          } else {
            openForm = !openForm;
          }
        },
      },
    ];
    return prev;
  });

  onMount(() => {
    let unique = new Set(listBelumLimpah.map((e) => e.pdm));
    if (unique.size !== listBelumLimpah.length)
      alert("Duplikat PDM Terdeteksi");
    toSortedPDM("DESC");
  });
</script>

<Table.Root
  class="border-none w-full bg-white [&_tr_*]:text-center border-collapse"
>
  <thead class="sticky top-0 left-0 bg-black z-[5] shadow-lg">
    <Table.Row class="hover:bg-black">
      <Table.Head class="relative">
        <div>
          <Checkbox
            class="border-white bg-white"
            onCheckedChange={(e) =>
              (checkAll = typeof e === "boolean" ? e : false)}
          />
        </div>
      </Table.Head>
      <Table.Head class="text-white font-bold h-14">No</Table.Head>
      <Table.Head class="text-white font-bold">
        <Button
          on:click={() => {
            toSortedPDM(shortPDM == "ASC" ? "DESC" : "ASC");
          }}
          ><span class="mr-2">PDM</span>
          <svelte:component
            this={shortPDM == "DESC" ? ChevronDown : ChevronUp}
          /></Button
        >
      </Table.Head>
      <Table.Head class="text-white font-bold">T7</Table.Head>
      <Table.Head class="text-white font-bold">T6</Table.Head>
      <Table.Head class="text-white font-bold">Ditahan</Table.Head>
      <Table.Head class="text-white font-bold">Terdakwa</Table.Head>
      <Table.Head class="text-white font-bold">JPU</Table.Head>
      <Table.Head class="text-white font-bold">Asal Perkara</Table.Head>
      <Table.Head class="text-white font-bold">Pasal</Table.Head>
      <Table.Head class="text-white font-bold">Barang Bukti</Table.Head>
      <Table.Head class="text-white font-bold">Aksi</Table.Head>
    </Table.Row>
  </thead>
  <Table.Body>
    {#each listBelumLimpah as perkara, i (perkara)}
      <Table.Row
        class="max-h-80"
        on:click={() => {
          let checkbox = document.querySelector(
            `button[data-pdm="${perkara.pdm}"]`,
          );
          if (checkbox && checkbox instanceof HTMLButtonElement)
            checkbox.click();
        }}
      >
        <Table.Cell
          ><Checkbox
            class="checkItem"
            data-pdm={perkara.pdm}
            checked={checkAll}
          /></Table.Cell
        >
        <Table.Cell class="text-xs">{i + 1}</Table.Cell>
        <Table.Cell class="text-xs">{perkara.pdm}</Table.Cell>
        <Table.Cell class="whitespace-nowrap text-xs"
          >{customDateToString(perkara.t7?.start) ?? "-"}<br />s.d<br
          />{customDateToString(perkara.t7?.end) ?? "-"}</Table.Cell
        >
        <Table.Cell class="whitespace-nowrap text-xs">
          {customDateToString(perkara.t6?.start) ?? "-"}<br />s.d<br
          />{customDateToString(perkara.t6?.end) ?? "-"}
        </Table.Cell>
        <Table.Cell class="text-xs">{perkara.ditahan}</Table.Cell>
        <Table.Cell class="text-xs">{perkara.terdakwa}</Table.Cell>
        <Table.Cell
          class="space-y-2 w-min flex-col items-center justify-center space-x-2"
        >
          <div class="space-y-2">
            {#each perkara.jpu as jpu}
              <Badge
                variant="secondary"
                class="whitespace-nowrap w-fit text-xs block m-auto"
                >{jpu.nama}</Badge
              >
            {/each}
          </div>
        </Table.Cell>
        <Table.Cell class="text-xs">{perkara.asalPerkara}</Table.Cell>
        <Table.Cell align="center" valign="middle">
          {#if perkara.pasal}
            <div
              class="max-h-36 p-1 m-auto text-wrap overflow-y-auto span text-center max-w-[200px] align-middle w-max overflow-ellipsis leading-4 overflow-x-hidden text-xs"
            >
              {perkara.pasal}
            </div>
          {:else}
            -
          {/if}
        </Table.Cell>
        <Table.Cell class="text-xs"
          >{transformBarangBuktiDisplay(perkara.barangBukti)}</Table.Cell
        >
        <Table.Cell>
          <DropdownMenu.Root preventScroll={false}>
            <DropdownMenu.Trigger asChild let:builder>
              <button
                use:builder.action
                {...builder}
                on:click={(ev) => {
                  ev.stopPropagation();
                }}
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                class="flex justify-between items-center"
                on:click={() => {
                  currentData = perkara;
                }}>Edit <Pencil size={16} /></DropdownMenu.Item
              >
              <form
                action="?/hapus"
                method="post"
                use:formNotification={{
                  onError(data) {
                    console.log(data);
                    return data?.hapus.message ?? "Gagal";
                  },
                }}
              >
                <input type="hidden" name="pdm" value={perkara.pdm} />
                <DropdownMenu.Item
                  ><button
                    class="flex items-center justify-between w-full"
                    type="submit"
                    ><p>Hapus</p>
                    <Trash size={16} /></button
                  ></DropdownMenu.Item
                >
              </form>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>

{#if !!currentData}
  <Drawer.Root
    open={!!currentData}
    closeOnOutsideClick={false}
    preventScroll={false}
  >
    <Drawer.Content class="max-h-[90vh]">
      <div class="m-auto overflow-y-auto p-5">
        <Drawer.Header>
          <Drawer.Title>Edit Perkara</Drawer.Title>
        </Drawer.Header>
        <form
          action="?/edit"
          method="post"
          use:formNotification={{
            onError(data) {
              return data?.edit.message ?? "Gagal";
            },
          }}
          class="min-w-80 w-min flex-shrink-0"
        >
          <div
            class="w-full gap-x-10 grid-cols-[repeat(2,_1fr)] col-span-3 space-y-2"
          >
            <div class="space-y-2">
              <Label>T7</Label>
              <div class="flex items-center gap-3">
                <div>
                  <Input
                    type="date"
                    value={parseDateToInputValue(currentData.t7?.start)}
                    name="t7start"
                  />
                </div>
                <small>s.d</small>
                <div>
                  <Input
                    type="date"
                    value={parseDateToInputValue(currentData.t7?.end)}
                    name="t7end"
                  />
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <Label>T6</Label>
              <div class="flex items-center gap-3">
                <div>
                  <Input
                    type="date"
                    value={parseDateToInputValue(currentData.t6?.start)}
                    name="t6start"
                  />
                </div>
                <small>s.d</small>
                <div>
                  <Input
                    type="date"
                    value={parseDateToInputValue(currentData.t6?.end)}
                    name="t6end"
                  />
                </div>
              </div>
            </div>
            <input type="hidden" name="pdm" required value={currentData.pdm} />
            <div class="space-y-2">
              <Label>Ditahan</Label>
              <Select.Root
                required
                selected={{
                  value: currentData.ditahan,
                  label: currentData.ditahan,
                }}
              >
                <Select.Input name="ditahan" required />
                <Select.Trigger>
                  <Select.Value placeholder="--" />
                </Select.Trigger>
                <Select.Content>
                  {#each pageData.tempatDitahan as ditahan}
                    <Select.Item value={ditahan}>{ditahan}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
            <div class="space-y-2">
              <Label>Terdakwa</Label>
              <Input name="terdakwa" required value={currentData.terdakwa} />
            </div>
            <div class="space-y-2">
              <Label>Asal Perkara</Label>
              <Select.Root
                required
                selected={{
                  value: currentData.asalPerkara,
                  label: currentData.asalPerkara,
                }}
              >
                <Select.Input name="asalPerkara" required />
                <Select.Trigger>
                  <Select.Value placeholder="--" />
                </Select.Trigger>
                <Select.Content>
                  {#each pageData.asalPerkara as asalPerkara}
                    <Select.Item value={asalPerkara}>{asalPerkara}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
            <div class="space-y-2">
              <Label>Jaksa</Label>
              <Select.Root
                preventScroll={false}
                multiple
                required
                selected={currentData.jpu.map((e) => ({
                  label: e.nama,
                  value: e.id,
                }))}
              >
                <Select.Input name="jpu" required />
                <Select.Trigger>
                  <Select.Value
                    class="text-wrap whitespace-pre-wrap text-start"
                    placeholder="--"
                  />
                </Select.Trigger>
                <Select.Content>
                  {#each listJaksa as jaksa}
                    <Select.Item value={jaksa.id}>{jaksa.nama}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
            <div class="space-y-2">
              <Label>Status BB</Label>
              <Select.Root
                preventScroll={false}
                required
                selected={{
                  label: transformBarangBuktiDisplay(currentData.barangBukti),
                  value: currentData.barangBukti,
                }}
              >
                <Select.Input name="barangBukti" required />
                <Select.Trigger placeholder="--">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="ada">Ada</Select.Item>
                  <Select.Item value="tidakAda">Tidak Ada</Select.Item>
                  <Select.Item value="dititip">Dititip</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div class="space-y-2">
              <Label>Pasal</Label>
              <Textarea name="pasal" rows={5} value={currentData.pasal} />
            </div>
          </div>
          <Drawer.Close class="mt-2 space-x-2">
            <Button type="submit">Submit</Button>
            <Button type="reset" variant="outline">Close</Button>
          </Drawer.Close>
        </form>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

<Dialog bind:open={showLimpahForm}>
  <DialogContent
    class="m-5 overflow-auto w-fit md:w-fit max-w-[80vw] p-0 max-h-[90vh] flex flex-col gap-0"
  >
    <div class="max-h-screen overflow-auto w-fit">
      <Table.Root class="w-min">
        <Table.Header
          class="sticky top-0 left-0 bg-white shadow-lg [&_th:first-child]:pl-5 [&_th:last-child]:pr-5 z-[6]"
        >
          <Table.Row>
            <Table.Head>Tanggal Limpah</Table.Head>
            <Table.Head>PDM</Table.Head>
            <Table.Head>TERDAKWA</Table.Head>
            <Table.Head>JPU</Table.Head>
            <Table.Head>CMS</Table.Head>
            <Table.Head>Berkas Terkirim ke PN</Table.Head>
            <Table.Head>E-Berpadu</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body class="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5">
          {#each limpahList as limpah}
            <Table.Row>
              <Table.Cell>
                <Input
                  type="datetime-local"
                  value={parseDateToInputDatetimeValue(limpah.tanggal)}
                  on:input={(ev) => {
                    if (ev.target instanceof HTMLInputElement) {
                      limpah.tanggal = new Date(ev.target.value);
                      console.log(limpah.tanggal, ev.target.value);
                    }
                  }}
                />
              </Table.Cell>
              <Table.Cell>
                {limpah.pdm}
              </Table.Cell>
              <Table.Cell>
                {limpah.terdakwa}
              </Table.Cell>
              <Table.Cell class="space-y-1">
                {#each limpah.jpu as jpu}
                  <Badge
                    variant="secondary"
                    class="whitespace-nowrap w-fit text-xs">{jpu.nama}</Badge
                  >
                {/each}
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  onCheckedChange={(e) => {
                    if (typeof e !== "string") limpah.cms = e;
                  }}
                />
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  onCheckedChange={(e) => {
                    if (typeof e !== "string") limpah.terkirim = e;
                  }}
                />
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  onCheckedChange={(e) => {
                    if (typeof e !== "string") limpah.eBerpadu = e;
                  }}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    <div class="flex items-center gap-2 p-2 shadow border">
      <Button on:click={() => uploadLimpah(limpahList)}
        >Limpahkan {PUBLIC_LIMPAH_SHEET.split(",").slice(-1)[0]}</Button
      >
      <Button variant="outline" on:click={() => (showLimpahForm = false)}
        >Close</Button
      >
    </div>
  </DialogContent>
</Dialog>
