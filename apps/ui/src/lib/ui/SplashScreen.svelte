<script>
  export let duration = 3000; // Duration for the splash screen to show in milliseconds
  let visible = true;
  import berry from "$lib/assets/berry.png";

  // Hide splash screen after the specified duration
  setTimeout(() => {
    visible = false;
  }, 2000);
</script>

<!-- 
<div class={"splash-screen " + (!visible ? "hidden" : "")}>
  <img src={berry} class="h-20" alt="" srcset="" />
  <h1>FlexiBerry</h1>
  <h6>An Api Testing framework</h6>
</div> -->

<style>
  .splash-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #fff; /* You can change the background color */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Make sure it stays on top */
    transition: opacity 0.5s ease-in-out;
  }
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
</style>
