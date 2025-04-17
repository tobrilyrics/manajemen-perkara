<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import TableJaksa from "./TabelJaksa.svelte";
  import FormTambah from "./FormTambah.svelte";
  import { actions } from "$lib/components/Navbar.svelte";

  export let data: PageData;
  export let form: ActionData;

  actions.update((p) => {
    return [];
  });
</script>

<div class="p-5 overflow-auto">
  <div class="flex gap-5">
    <FormTambah form={data.jaksaForm} actionData={form} />
    <TableJaksa listJaksa={data.listJaksa} actionData={form} />
  </div>
</div>
