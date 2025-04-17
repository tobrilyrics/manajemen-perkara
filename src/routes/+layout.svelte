<script lang="ts">
  import PageLoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import "../app.pcss";
  import type {PageData} from "./$types"

  export let data: PageData;
</script>

<PageLoadingIndicator />

<!-- Notification https://svelte-sonner.vercel.app/ -->
<Toaster richColors closeButton expand />

<div>
  <Navbar {data}/>
  <div class="pt-16 h-screen w-screen overflow-hidden">
    <slot />
  </div>
</div>
