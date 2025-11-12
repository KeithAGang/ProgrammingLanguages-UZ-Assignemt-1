<script>
	import { enhance } from '$app/forms';

	let { inventory = [], form, onProductClick = null } = $props();

	let searchTerm = $state('');
	let shopFilter = $state('all');

	let filteredInventory = $derived(
		inventory.filter((item) => {
			const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesShop = shopFilter === 'all' || item.shop === shopFilter;
			return matchesSearch && matchesShop;
		})
	);

	function getStatusColor(status) {
		if (status === 'out-of-stock') return 'bg-red-100 text-red-800';
		if (status === 'low') return 'bg-yellow-100 text-yellow-800';
		return 'bg-green-100 text-green-800';
	}

	function getStatusText(status) {
		if (status === 'out-of-stock') return 'Out of Stock';
		if (status === 'low') return 'Low Stock';
		return 'OK';
	}

	function handleRowClick(item) {
		if (onProductClick) {
			onProductClick(item);
		}
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Inventory Overview</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
		<div>
			<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
			<input
				type="text"
				id="search"
				bind:value={searchTerm}
				placeholder="Search by product name..."
				class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="shopFilter" class="block text-sm font-medium text-gray-700 mb-1">Filter by Shop</label>
			<select
				id="shopFilter"
				bind:value={shopFilter}
				class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
			>
				<option value="all">All Shops</option>
				<option value="grocery">Grocery</option>
				<option value="hardware">Hardware</option>
			</select>
		</div>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse">
			<thead>
				<tr class="bg-gray-200">
					<th class="border p-2 text-left font-bold">Product</th>
					<th class="border p-2 text-left font-bold">SKU</th>
					<th class="border p-2 text-left font-bold">Shop</th>
					<th class="border p-2 text-right font-bold">Quantity</th>
					<th class="border p-2 text-right font-bold">Min Threshold</th>
					<th class="border p-2 text-center font-bold">Status</th>
					<th class="border p-2 text-center font-bold">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredInventory as item, i}
					<tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors">
						<td class="border p-2" onclick={() => handleRowClick(item)}>{item.productName}</td>
						<td class="border p-2 text-gray-600" onclick={() => handleRowClick(item)}>{item.sku || 'N/A'}</td>
						<td class="border p-2 capitalize" onclick={() => handleRowClick(item)}>{item.shop}</td>
						<td class="border p-2 text-right font-semibold" onclick={() => handleRowClick(item)}>{item.quantity}</td>
						<td class="border p-2 text-right" onclick={() => handleRowClick(item)}>{item.minThreshold}</td>
						<td class="border p-2 text-center" onclick={() => handleRowClick(item)}>
							<span class="px-2 py-1 rounded text-sm font-bold {getStatusColor(item.status)}">
								{getStatusText(item.status)}
							</span>
						</td>
						<td class="border p-2 text-center">
							<form
								method="POST"
								action="?/deleteInventory"
								use:enhance={() => {
									return async ({ update }) => {
										if (confirm('Are you sure you want to delete this inventory item?')) {
											await update();
										}
									};
								}}
							>
								<input type="hidden" name="inventoryId" value={item.id} />
								<button
									type="submit"
									class="inline-flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
								>
									<span class="material-symbols-outlined text-sm">delete</span>
									Delete
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if filteredInventory.length === 0}
		<p class="text-gray-500 text-center py-8">No inventory items found</p>
	{/if}
</div>
