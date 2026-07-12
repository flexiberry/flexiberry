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

	<!-- Site Navigation Schema to encourage Google Sitelinks -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			"itemListElement": [
				{
					"@type": "SiteNavigationElement",
					"position": 1,
					"name": "Documentation",
					"url": "https://docs.flexiberry.dev/"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 2,
					"name": "Web App",
					"url": "https://app.flexiberry.dev"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 3,
					"name": "Features",
					"url": "https://flexiberry.dev/features"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 4,
					"name": "Guides",
					"url": "https://flexiberry.dev/blog"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 5,
					"name": "Examples",
					"url": "https://flexiberry.dev/example"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 6,
					"name": "Playground",
					"url": "https://flexiberry.dev/playground"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 7,
					"name": "About Us",
					"url": "https://flexiberry.dev/about"
				},
				{
					"@type": "SiteNavigationElement",
					"position": 8,
					"name": "Changelog",
					"url": "https://flexiberry.dev/changelog"
				}
			]
		}
	</script>
</svelte:head>

{@render children()}
