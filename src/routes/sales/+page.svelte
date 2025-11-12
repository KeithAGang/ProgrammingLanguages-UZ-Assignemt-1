<script>
	import SalesForm from '$lib/components/sales/SalesForm.svelte';
	import SalesHistory from '$lib/components/sales/SalesHistory.svelte';

	let { data, form } = $props();
</script>

<div class="p-8 max-w-7xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-gray-800">Sales Management</h1>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<SalesForm products={data.products} {form} />
		<SalesHistory sales={data.todaysSales} />
	</div>
</div>
