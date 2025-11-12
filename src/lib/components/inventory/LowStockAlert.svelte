<script>
	let { lowStockItems = [] } = $props();

	function getUrgencyColor(urgency) {
		if (urgency === 'critical') return 'border-red-500 bg-red-50';
		if (urgency === 'high') return 'border-orange-500 bg-orange-50';
		return 'border-yellow-500 bg-yellow-50';
	}

	function getUrgencyLevel(item) {
		if (item.quantity === 0) return 'critical';
		if (item.quantity < item.minThreshold / 2) return 'high';
		return 'medium';
	}
</script>

{#if lowStockItems.length > 0}
	<div class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
		<h3 class="text-lg font-bold text-red-800 mb-4">Low Stock Alerts</h3>

		<div class="space-y-2">
			{#each lowStockItems as item}
				{@const urgency = getUrgencyLevel(item)}
				<div class="flex justify-between items-center py-2 px-3 bg-white rounded border {getUrgencyColor(urgency)}">
					<div>
						<span class="font-semibold">{item.productName}</span>
						<span class="text-sm text-gray-600 ml-2">({item.shop})</span>
					</div>
					<div class="text-right">
						<span class="font-bold text-red-600">{item.quantity}</span>
						<span class="text-sm text-gray-600">/ {item.minThreshold}</span>
						{#if item.quantity === 0}
							<span class="ml-2 text-xs font-bold text-red-600 uppercase">Out of Stock!</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
