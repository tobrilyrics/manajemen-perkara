<script lang="ts">
  import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
  } from "$lib/components/ui/table";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
  } from "$lib/components/ui/dialog";
  import { actions } from "$lib/components/Navbar.svelte";
  import type { PageData } from "./$types";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { PUBLIC_LIMPAH_SHEET } from "$env/static/public";
  import { Button } from "$lib/components/ui/button";
  import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogAction,
  } from "$lib/components/ui/alert-dialog";
  import { Checkbox } from "$lib/components/ui/checkbox";

  export let data: PageData;
  let limpahList = data.limpahList;
  let showSheetList = false;

  actions.set([
    {
      variant: "secondary",
      label: data.sheetName,
      onClick: () => (showSheetList = !showSheetList),
    },
  ]);
</script>

<AlertDialog open={!!data.message}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Error</AlertDialogTitle>
      <AlertDialogDescription>{data.message}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction asChild let:builder>
        <Button builders={[builder]} variant="destructive">Continue</Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

<Dialog bind:open={showSheetList}>
  <DialogContent class="mt-[10vh] pt-10">
    <DialogHeader>
      {#each PUBLIC_LIMPAH_SHEET.split(",").map((e) => e.trim()) as sheet}
        <Button
          on:click={() => {
            showSheetList = false;
            location.assign(`?sheet=${sheet}`);
          }}>{sheet}</Button
        >
      {/each}
    </DialogHeader>
  </DialogContent>
</Dialog>

<div class="overflow-auto h-full">
  <Table class="bg-white">
    <TableHeader class="sticky top-0 left-0 bg-black shadow-md font-bold z-[9]">
      <TableRow
        class="[&_:is(th,td):first-child]:pl-5 text-center [&_:is(th)]:text-center [&_:is(th,td):last-child]:pr-5 [&_:is(th,td)]:text-white hover:bg-black [&_:is(input)]:text-black [&_*]:whitespace-nowrap"
      >
        <TableHead class="py-2 text-center"
          >No<Input
            class="w-10"
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.no.toLowerCase().includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Hari/Tggl<Input
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.tanggal
                    .toLowerCase()
                    .includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Pukul<Input
            class="w-20"
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.pukul.includes(input.value);
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Terdakwa<Input
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.terdakwa
                    .toLowerCase()
                    .includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >JPU<Input
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.jpu
                    .toLowerCase()
                    .includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Asal Perkara<Input
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.asalPerkara
                    .toLowerCase()
                    .includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Pasal<Input
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  return e.pasal
                    .toLowerCase()
                    .includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead
          >Barang Bukti<Input
            class="w-24"
            on:input={(ev) => {
              if (ev.target instanceof HTMLInputElement) {
                let input = ev.target;
                limpahList = data.limpahList.filter((e) => {
                  let a = e.bbAda
                    ? "Ada"
                    : e.bbTidakAda
                      ? "Tidak Ada"
                      : "Dititip";
                  return a.toLowerCase().includes(input.value.toLowerCase());
                });
              }
            }}
          /></TableHead
        >
        <TableHead>
          CMS
          <div class="flex items-end justify-center">
            <Checkbox
              class="bg-white border-white"
              onCheckedChange={(v) => {
                limpahList = data.limpahList.filter((e) => !v || e.cms);
              }}
            />
          </div>
        </TableHead>
        <TableHead>
          Berkas Ke PN
          <div class="flex items-end justify-center">
            <Checkbox
              class="bg-white border-white"
              onCheckedChange={(v) => {
                limpahList = data.limpahList.filter((e) => !v || e.berkasPn);
              }}
            />
          </div>
        </TableHead>
        <TableHead>
          E-Berpadu
          <div class="flex items-end justify-center">
            <Checkbox
              class="bg-white border-white"
              onCheckedChange={(v) => {
                limpahList = data.limpahList.filter((e) => !v || e.eBerpadu);
              }}
            />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each limpahList as limpah (limpah)}
        <TableRow
          class="[&_:is(th,td):first-child]:pl-5 [&_:is(th,td):last-child]:pr-5"
        >
          <TableCell class="py-3">
            <div class="flex items-center justify-center">
              {limpah.no}
            </div>
          </TableCell>
          <TableCell>{limpah.tanggal}</TableCell>
          <TableCell>{limpah.pukul}</TableCell>
          <TableCell>{limpah.terdakwa}</TableCell>
          <TableCell>
            <div
              class="space-x-1 space-y-1 max-w-sm flex flex-col items-center justify-center"
            >
              {#each limpah.jpu.split("/").map((e) => e.trim()) as jpu}
                <Badge variant="outline" class="whitespace-nowrap text-nowrap">{jpu}</Badge>
              {/each}
            </div>
          </TableCell>
          <TableCell>{limpah.asalPerkara}</TableCell>
          <TableCell>
            <div
              class="max-h-36 text-wrap overflow-y-auto span text-start max-w-[200px] w-full overflow-ellipsis leading-4 overflow-x-hidden text-xs"
            >
              {(limpah.pasal && limpah.pasal) || "-"}
            </div>
          </TableCell>
          <TableCell>
            {#if limpah.bbAda}
              Ada
            {:else if limpah.bbTidakAda}
              Tidak Ada
            {:else}
              Dititip
            {/if}
          </TableCell>
          <TableCell>
            <div class="flex justify-center">
              <Checkbox radiogroup="filter" checked={limpah.cms} disabled />
            </div>
          </TableCell>
          <TableCell>
            <div class="flex justify-center">
              <Checkbox
                radiogroup="filter"
                checked={limpah.berkasPn}
                disabled
              />
            </div>
          </TableCell>
          <TableCell>
            <div class="flex justify-center">
              <Checkbox
                radiogroup="filter"
                checked={limpah.eBerpadu}
                disabled
              />
            </div>
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</div>
