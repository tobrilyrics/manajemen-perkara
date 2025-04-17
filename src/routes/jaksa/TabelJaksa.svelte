<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Card from "$lib/components/ui/card";
  import * as Select from "$lib/components/ui/select";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { formNotification } from "$lib/actions";
  import type { JaksaRowType } from "$lib/server/sheets-api";
  import { MoreVertical, Trash2 as Trash, Pencil } from "lucide-svelte";
  import { applyAction, deserialize } from "$app/forms";
  import { toastPromise } from "$lib/utils";
  import { invalidateAll } from "$app/navigation";
  import type { ActionData } from "./$types";

  export let listJaksa: JaksaRowType[] = [];
  export let actionData: ActionData;

  let currentJaksa: JaksaRowType | null = null;

  async function hapus(no: number) {
    let { resolve, reject } = toastPromise({
      loading: "Hapus Data...",
    });
    let formData = new FormData();
    formData.set("id", no.toString());

    let response = await fetch("?/hapus", {
      method: "POST",
      body: formData,
    });

    let result = deserialize(await response.text());
    if (result.type === "success") resolve("Sukses");
    else reject("Gagal");
    invalidateAll();
    applyAction(result);
  }
</script>

<Card.Root class="w-min">
  <Card.Header>
    <Card.Title>Data Jaksa</Card.Title>
    <Card.Description>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam, natus.</Card.Description
    >
  </Card.Header>
  <Card.Content>
    <Table.Root class="w-max">
      <Table.Header>
        <Table.Row>
          <Table.Head>No</Table.Head>
          <Table.Head>Username</Table.Head>
          <Table.Head>Nama</Table.Head>
          <Table.Head>Satker</Table.Head>
          <Table.Head>Aksi</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each listJaksa as jaksa, i}
          <Table.Row>
            <Table.Cell>{i + 1}</Table.Cell>
            <Table.Cell>{jaksa.id}</Table.Cell>
            <Table.Cell>{jaksa.nama}</Table.Cell>
            <Table.Cell>{jaksa.cabang}</Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root preventScroll={false}>
                <DropdownMenu.Trigger>
                  <MoreVertical size={18} />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    class="flex justify-between items-center"
                    on:click={() => (currentJaksa = jaksa)}
                    >Edit <Pencil size={16} /></DropdownMenu.Item
                  >
                  <form
                    action="?/hapus"
                    method="post"
                    use:formNotification={{
                      onError: () => {
                        return actionData?.hapus?.message;
                      },
                    }}
                  >
                    <input type="hidden" name="id" value={jaksa.id} />
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
  </Card.Content>
</Card.Root>

<Drawer.Root
  preventScroll={false}
  open={!!currentJaksa}
  shouldScaleBackground
  backgroundColor="white"
  closeOnOutsideClick={false}
>
  <Drawer.Content>
    {#if !!currentJaksa}
      <div class="mx-auto w-full max-w-sm mb-10">
        <Drawer.Header class="px-0">
          <Drawer.Title>Edit Jaksa</Drawer.Title>
          <Drawer.Description>Edit Data Jaksa</Drawer.Description>
        </Drawer.Header>
        <form
          action="?/edit"
          method="post"
          use:formNotification={{
            onError(data) {
              return data?.edit.message ?? "Gagal";
            },
          }}
          class="space-y-2"
        >
          <input name="id" type="hidden" value={currentJaksa.id} />
          <div class="space-y-2">
            <Label>Nama</Label>
            <Input name="nama" value={currentJaksa.nama} />
          </div>
          <div class="space-y-2">
            <Label>Cabang</Label>
            <Select.Root
              selected={{
                label: currentJaksa.cabang,
                value: currentJaksa.cabang,
              }}
            >
              <Select.Input name="cabang" />
              <Select.Trigger>
                <Select.Value placeholder="--" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="Kejari">Kejari</Select.Item>
                <Select.Item value="Kejati">Kejati</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div class="space-y-2">
            <Drawer.Close>
              <Button type="submit">Simpan</Button>
              <Button type="reset" variant="outline">Close</Button>
            </Drawer.Close>
          </div>
        </form>
      </div>
    {:else}
      <Drawer.Header>
        <Drawer.Title>GOTCHA</Drawer.Title>
      </Drawer.Header>
    {/if}
  </Drawer.Content>
</Drawer.Root>
