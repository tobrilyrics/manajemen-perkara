<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLTableAttributes } from "svelte/elements";

  type $$Props = HTMLTableAttributes;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<table class={cn("w-full caption-bottom text-sm", className)} {...$$restProps}>
  <slot />
</table>
