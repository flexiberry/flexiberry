<script lang="ts">
	import '../app.css';
	import { PUBLIC_GA_ID, PUBLIC_ADSENSE_ID } from '$env/static/public';

	let { children } = $props();
</script>

<svelte:head>
	{#if PUBLIC_GA_ID}
		<!-- Google tag (gtag.js) -->
		<script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GA_ID}"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '{PUBLIC_GA_ID}');
		</script>
	{/if}

	{#if PUBLIC_ADSENSE_ID}
		<!-- Google AdSense -->
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUBLIC_ADSENSE_ID}"
			crossorigin="anonymous"></script>
	{/if}
</svelte:head>

{@render children()}
