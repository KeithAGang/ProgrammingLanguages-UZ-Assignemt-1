<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavBar from '$lib/components/dashboard/NavBar.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<NavBar user={data.user} />
{/if}

<main class="bg-gray-50 min-h-screen">
	{@render children()}
</main>
