<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import * as Select from "$lib/components/ui/select";
  import type { SuperValidated } from "sveltekit-superforms";
  import { type PerkaraSchema, perkaraSchema } from "./schema";
  import { formNotification } from "$lib/actions";
  import { Label } from "$lib/components/ui/label";
  import type { JaksaRowType } from "$lib/server/sheets-api";
  import type { ActionData, PageData } from "./$types";

  export let form: SuperValidated<PerkaraSchema>;
  export let data: PageData;
  export let listJaksa: JaksaRowType[] = [];
  export let openForm: boolean;

  let myFormNotification = formNotification<any, ActionData>;
</script>

{#key form}
  <Form.Root {form} schema={perkaraSchema} asChild let:attrs let:config>
    <form
      action="?/tambah"
      method="post"
      use:myFormNotification={{
        onError: (data) => {
          console.log(data);
          return data?.tambah?.message ?? "Gagal";
        },
        onSuccess: (data) => {
          openForm = false;
          return data?.tambah?.message ?? "Sukses";
        },
      }}
      {...attrs}
      class="min-w-80 w-min flex-shrink-0"
    >
      <div class="mb-4">
        <h5 class="text-xl font-bold">Tambah Data</h5>
        <small class="text-muted-foreground">Tambah Data Perkara</small>
      </div>
      <div class="w-full gap-x-10 grid-cols-[repeat(2,_1fr)] col-span-3">
        <div class="space-y-2">
          <Label>T7</Label>
          <div class="flex items-center gap-3">
            <Form.Field {config} name="t7start">
              <Form.Item>
                <Form.Input type="date" />
                <Form.Validation />
              </Form.Item>
            </Form.Field>
            <small>s.d</small>
            <Form.Field {config} name="t7end">
              <Form.Item>
                <Form.Input type="date" />
                <Form.Validation />
              </Form.Item>
            </Form.Field>
          </div>
        </div>
        <div class="space-y-2">
          <Label>T6</Label>
          <div class="flex items-center gap-3">
            <Form.Field {config} name="t6start">
              <Form.Item>
                <Form.Input type="date" />
                <Form.Validation />
              </Form.Item>
            </Form.Field>
            <small>s.d</small>
            <Form.Field {config} name="t6end">
              <Form.Item>
                <Form.Input type="date" />
                <Form.Validation />
              </Form.Item>
            </Form.Field>
          </div>
        </div>
        <Form.Field {config} name="pdm">
          <Form.Item>
            <Form.Label>PDM</Form.Label>
            <Form.Input />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="ditahan">
          <Form.Item>
            <Form.Label>Ditahan</Form.Label>
            <Form.Select>
              <Form.SelectTrigger placeholder="--" />
              <Form.SelectContent>
                {#each data.tempatDitahan as ditahan}
                  <Form.SelectItem value={ditahan}>{ditahan}</Form.SelectItem>
                {/each}
              </Form.SelectContent>
            </Form.Select>
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="terdakwa">
          <Form.Item>
            <Form.Label>Terdakwa</Form.Label>
            <Form.Input />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="asalPerkara">
          <Form.Item>
            <Form.Label>Asal Perkara</Form.Label>
            <Form.Select>
              <Form.SelectTrigger placeholder="--" />
              <Form.SelectContent>
                {#each data.asalPerkara as asalPerkara}
                  <Form.SelectItem value={asalPerkara}
                    >{asalPerkara}</Form.SelectItem
                  >
                {/each}
              </Form.SelectContent>
            </Form.Select>
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <div class="space-y-2 mb-2">
          <Label>Jaksa</Label>
          <Select.Root multiple required>
            <Select.Input name="jpu" required />
            <Select.Trigger>
              <Select.Value
                class="whitespace-pre-wrap text-wrap text-start"
                placeholder="--"
              />
            </Select.Trigger>
            <Select.Content>
              {#each listJaksa as jaksa}
                <Select.Item value={jaksa.id}>{jaksa.nama.trim()}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <Form.Field {config} name="barangBukti">
          <Form.Item>
            <Form.Label>Barang Bukti</Form.Label>
            <Form.Select>
              <Form.SelectTrigger placeholder="--" />
              <Form.SelectContent>
                <Form.SelectItem value="ada">Ada</Form.SelectItem>
                <Form.SelectItem value="tidakAda">Tidak Ada</Form.SelectItem>
                <Form.SelectItem value="dititip">Dititip</Form.SelectItem>
              </Form.SelectContent>
            </Form.Select>
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="pasal">
          <Form.Item class="mt-2">
            <Form.Label>Pasal</Form.Label>
            <Form.Textarea />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
      </div>
      <Form.Button>Submit</Form.Button>
      <Form.Button
        type="reset"
        variant="secondary"
        on:click={() => (openForm = false)}>Close</Form.Button
      >
    </form>
  </Form.Root>
{/key}
