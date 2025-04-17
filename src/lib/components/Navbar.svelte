<script context="module" lang="ts">
  export type Action = {
    variant:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | undefined;
    onClick: () => void;
    label: string;
  };
  export let actions = writable<Action[]>([]);
</script>

<script lang="ts">
  import { Menu, LogOut, FileText, Target, XIcon, LogIn } from "lucide-svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import type { PageData } from "../../routes/$types";
  import { writable } from "svelte/store";
  import { Button } from "./ui/button";

  export let data: PageData;
</script>

<div class="fixed top-0 left-0 w-full z-[5]" id="navbar">
  <nav class="h-16 bg-red-800 text-white flex items-center">
    <Sheet.Root>
      <Sheet.Trigger asChild let:builder>
        <button
          class="h-full aspect-square active:ring ring-inset center transition-all sm:hidden"
          use:builder.action
          {...builder}
        >
          <img
            src="/favicon.png"
            alt=""
            class="h-full aspect-square p-3 object-cover"
          />
        </button>
      </Sheet.Trigger>
      <Sheet.Content side="left" class="w-full p-0">
        <div class="h-16 w-full flex items-center bg-red-800 text-white">
          <img
            src="/favicon.png"
            alt=""
            class="h-full aspect-square p-3 object-cover"
          />
          <div class="w-full" />
          <Sheet.Close
            class="h-full aspect-square center active:ring ring-inset transition-all hover:bg-white/10"
          >
            <XIcon />
          </Sheet.Close>
        </div>
        <div class="flex flex-col">
          <Sheet.Close>
            <a
              href="/jaksa"
              class="flex items-center gap-3 active:ring ring-inset h-16 p-5 transition-all hover:underline"
            >
              <FileText class="sm:hidden" />
              <p>Jaksa</p>
            </a>
          </Sheet.Close>
          <Sheet.Close>
            <a
              href="/perkara"
              class="flex items-center gap-3 active:ring ring-inset h-full p-5 transition-all hover:underline"
            >
              <FileText class="sm:hidden" />
              <p>Perkara</p>
            </a>
          </Sheet.Close>
          <Sheet.Close>
            <a
              href="/limpah"
              class="flex items-center gap-3 active:ring ring-inset h-full p-5 transition-all hover:underline"
            >
              <FileText class="sm:hidden" />
              <p>Limpah</p>
            </a>
          </Sheet.Close>
          <div class="flex items-center flex-wrap p-5 gap-5">
            {#each $actions as action}
              <Button variant={action.variant} on:click={action.onClick}
                >{action.label}</Button
              >
            {/each}
          </div>
        </div>
      </Sheet.Content>
    </Sheet.Root>
    <div
      class="h-full aspect-square hidden sm:flex items-center justify-center"
    >
      <img
        src="/favicon.png"
        alt=""
        class="h-full aspect-square p-3 object-cover"
      />
    </div>
    <div class="flex-shrink-0">
      <h2 class="text-2xl font-serif">SIMPEL</h2>
      <small>Sistem Informasi Manajemen Pelimpahan Perkara</small>
    </div>
    <div class="w-full" />
    <div class="h-full w-full sm:flex items-center justify-end hidden gap-2">
      {#each $actions as action}
        <Button variant={action.variant} on:click={action.onClick}
          >{action.label}</Button
        >
      {/each}
      <a
        href="/jaksa"
        class="flex items-center gap-3 active:ring ring-inset h-full p-5 transition-all hover:underline"
      >
        <FileText class="sm:hidden" />
        <p>Jaksa</p>
      </a>
      <a
        href="/perkara"
        class="flex items-center gap-3 active:ring ring-inset h-full p-5 transition-all hover:underline"
      >
        <filetext class="sm:hidden" />
        <p>Perkara</p>
      </a>
      <a
        href="/limpah"
        class="flex items-center gap-3 active:ring ring-inset h-full p-5 transition-all hover:underline"
      >
        <filetext class="sm:hidden" />
        <p>Limpah</p>
      </a>
      {#if data.user}
        <a
          href="/logout"
          class="h-full px-5 center bg-red-700 hover:bg-blue-800 transition-all active:ring ring-inset"
          >Logout <LogOut class="ml-2" size={18} />
        </a>
      {:else}
        <a
          href="/oauth"
          class="h-full px-5 center bg-blue-700 hover:bg-blue-800 transition-all active:ring ring-inset"
          >Login <LogIn class="ml-2" size={18} />
        </a>
      {/if}
    </div>
  </nav>
</div>
