<script>
	let { sales = [] } = $props();

	let totalSales = $derived(sales.reduce((sum, sale) => sum + sale.totalAmount, 0));

	function formatDate(timestamp) {
		const date = new Date(timestamp * 1000);
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-2xl font-bold">Today's Sales</h2>
		<div class="text-right">
			<div class="text-sm text-gray-600">Total</div>
			<div class="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
		</div>
	</div>

	{#if sales.length === 0}
		<p class="text-gray-500 text-center py-8">No sales recorded today</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full table-auto border-collapse">
				<thead>
					<tr class="bg-gray-200">
						<th class="border p-2 text-left font-bold">Time</th>
						<th class="border p-2 text-left font-bold">Shop</th>
						<th class="border p-2 text-left font-bold">Product</th>
						<th class="border p-2 text-right font-bold">Qty</th>
						<th class="border p-2 text-right font-bold">Unit Price</th>
						<th class="border p-2 text-right font-bold">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each sales as sale, i}
						<tr class={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
							<td class="border p-2">{formatDate(sale.saleDate)}</td>
							<td class="border p-2 capitalize">{sale.shop}</td>
							<td class="border p-2">{sale.productName}</td>
							<td class="border p-2 text-right">{sale.quantity}</td>
							<td class="border p-2 text-right">${sale.unitPrice.toFixed(2)}</td>
							<td class="border p-2 text-right font-semibold">${sale.totalAmount.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
