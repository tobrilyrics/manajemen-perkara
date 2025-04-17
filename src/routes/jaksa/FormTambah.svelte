<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import type { SuperValidated } from "sveltekit-superforms";
  import { jaksaSchema, type JaksaSchema } from "./schema";
  import { formNotification } from "$lib/actions";
  import type { ActionData } from "./$types";
  export let form: SuperValidated<JaksaSchema>;
  export let actionData: ActionData;
</script>

<Form.Root {form} schema={jaksaSchema} asChild let:config let:attrs>
  <form
    action="?/tambah"
    method="post"
    use:formNotification={{
      loading: "Tambah Jaksa...",
      onError: () => actionData?.tambah?.message ?? "Gagal",
    }}
    {...attrs}
    class="min-w-80"
  >
    <Card.Root>
      <Card.Header>
        <Card.Title>Tambah Data</Card.Title>
        <Card.Description>Tambah Data Jaksa</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-2">
        <Form.Field {config} name="id">
          <Form.Item>
            <Form.Label>username</Form.Label>
            <Form.Input />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="password">
          <Form.Item>
            <Form.Label>Password</Form.Label>
            <Form.Input />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="nama">
          <Form.Item>
            <Form.Label>Nama</Form.Label>
            <Form.Input />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="cabang">
          <Form.Item>
            <Form.Label>Satker</Form.Label>
            <Form.Select>
              <Form.SelectTrigger placeholder="--" />
              <Form.SelectContent>
                <Form.SelectItem value="Kejari">Kejari</Form.SelectItem>
                <Form.SelectItem value="Kejati">Kejati</Form.SelectItem>
              </Form.SelectContent>
            </Form.Select>
          </Form.Item>
        </Form.Field>
      </Card.Content>
      <Card.Footer>
        <Form.Button>Submit</Form.Button>
      </Card.Footer>
    </Card.Root>
  </form>
</Form.Root>
