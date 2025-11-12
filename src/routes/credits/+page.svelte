<script>
	import CreditForm from '$lib/components/credits/CreditForm.svelte';
	import CreditLedger from '$lib/components/credits/CreditLedger.svelte';

	let { data, form } = $props();
</script>

<div class="p-8 max-w-7xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-gray-800">Credit Management</h1>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<CreditForm clients={data.clients} {form} />
		<CreditLedger clients={data.clients} transactions={data.transactions} />
	</div>
</div>
