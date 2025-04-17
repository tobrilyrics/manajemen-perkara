<script lang="ts">
  import { flyAndScale } from "$lib/utils";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import TablePerkara from "./TablePerkara.svelte";
  import TambahForm from "./TambahForm.svelte";

  export let data: PageData;

  let openForm = false;
</script>

{#if openForm}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:click|self={() => {
      openForm = false
    }}
    transition:fade|global
    class="w-screen h-screen fixed top-0 left-0 flex items-start justify-center z-[6] bg-black/25 overflow-auto"
  >
    <div
      id="tambahContainer"
      class="bg-white my-20 p-5 rounded-lg border shadow"
      transition:flyAndScale|global
    >
      <TambahForm
        bind:openForm
        {data}
        form={data.perkaraForm}
        listJaksa={data.listJaksa.map((e, i) => ({ ...e, row: i }))}
      />
    </div>
  </div>
{/if}
<div class="w-full h-full overflow-auto">
  <TablePerkara
    pageData={data}
    bind:openForm
    listBelumLimpah={data.listBelumLimpah}
    listJaksa={data.listJaksa}
  />
</div>
