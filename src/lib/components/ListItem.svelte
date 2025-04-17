<script lang="ts" generics="T extends Object, M extends boolean = false">
  import * as Select from "$lib/components/ui/select";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import type { Selected } from "bits-ui";
  import { Button } from "./ui/button";
  import { ChevronsDownUpIcon } from "lucide-svelte";

  export let items: T[];
  export let transformer: (arg0: T) => Selected;
  export let onSelect: (arg0: T, arg1: Selected) => void = () => {};

  type Selected = { value: string; label: string };
  type WhenTrue<TrueOrFalse, IfTrue, IfFalse, IfNeither = IfTrue | IfFalse> = [
    TrueOrFalse,
  ] extends [true]
    ? IfTrue
    : [TrueOrFalse] extends [false]
      ? IfFalse
      : IfNeither;

  export let name: string | undefined = undefined;
  export let multiple: M | undefined = undefined;
  export let selected:
    | WhenTrue<typeof multiple, Selected[], Selected>
    | undefined = undefined;

</script>

<Popover.Root>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      class="w-full justify-between"
    >
      --
      <ChevronsDownUpIcon size={12} />
    </Button>
  </Popover.Trigger>
  <Popover.Content sameWidth class="p-0">
    <Command.Root>
      <Command.List>
        {#each items as item}
          <Command.Item>
            {transformer(item).label}
          </Command.Item>
        {/each}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>

<!-- <Select.Root {name} {multiple} {selected}>
  <Select.Trigger>
    <Select.Value placeholder="--" />
  </Select.Trigger>
  <Select.Content>
    {#each items as item}
      <Select.Item
        on:click={() => {
          onSelect(item, transformer(item));
          if(multiple){
          }
        }}
        value={transformer(item).value}>{transformer(item).label}</Select.Item
      >
    {/each}
  </Select.Content>
</Select.Root> -->
