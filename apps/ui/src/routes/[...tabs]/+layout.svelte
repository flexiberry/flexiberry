<script>
  import { page } from "$app/stores";
  import * as Card from "$lib/components/ui/card/index";
  let tabs = $page.params.tabs;
</script>

<!-- <Card.Root>
  <Card.Content>rint</Card.Content>
</Card.Root> -->

<slot></slot>
