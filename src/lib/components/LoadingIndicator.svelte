<script lang="ts">
  import { navigating } from "$app/stores";
  import { fade } from "svelte/transition";
</script>

{#if $navigating}
  <div transition:fade class="fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5">
    <div class="h-20 w-20 border-t rounded-full border-black animate-spin"/>
    <p>Loading...</p>
  </div>
{/if}
