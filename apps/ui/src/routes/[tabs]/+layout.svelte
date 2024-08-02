<script>
  import { page } from "$app/stores";
  let tabs = $page.params.tabs;
</script>

<h1>blog post {tabs}</h1>

<slot></slot>
