<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/dashboard');
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<span class="material-symbols-outlined text-5xl mb-4 animate-spin text-blue-600">refresh</span>
		<p class="text-gray-600">Redirecting to dashboard...</p>
	</div>
</div>
