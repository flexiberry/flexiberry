<script>
  import { Button } from "bits-ui";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../lib/components/ui/card";
  import Header from "../lib/ui/Header.svelte";
</script>

<Header />

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cumque facilis
      natus explicabo id neque voluptates repellat assumenda tempore delectus
      quibusdam at recusandae, culpa voluptatibus eaque praesentium magnam quae
      atque quam.
    </p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
    <!-- <Button size="lg" variant="ghost">Click me</Button> -->
  </CardFooter>
</Card>
