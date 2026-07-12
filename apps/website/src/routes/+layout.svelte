<script lang="ts">
	import "../app.css";
	import { PUBLIC_GA_ID, PUBLIC_ADSENSE_ID } from "$env/static/public";
	import { page } from "$app/stores";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="canonical" href="https://flexiberry.dev{$page.url.pathname.endsWith('/') && $page.url.pathname !== '/' ? $page.url.pathname.slice(0, -1) : $page.url.pathname}" />
	<link rel="alternate" type="text/plain" title="LLM-friendly version" href="/llms.txt" />
	<!-- Google tag (gtag.js) -->
	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-QBBQE9VN3V"
	></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "G-QBBQE9VN3V");
	</script>

	<!-- Google AdSense -->
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9551608385785829"
		crossorigin="anonymous"
	></script>
</svelte:head>

{@render children()}
