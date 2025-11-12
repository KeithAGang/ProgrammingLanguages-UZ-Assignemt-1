<script>
	import InventoryTable from '$lib/components/inventory/InventoryTable.svelte';
	import AddProduct from '$lib/components/inventory/AddProduct.svelte';
	import AdjustStock from '$lib/components/inventory/AdjustStock.svelte';
	import EditInventory from '$lib/components/inventory/EditInventory.svelte';

	let { data, form } = $props();

	let activeTab = $state('low-stock');
	let selectedInventoryItem = $state(null);

	function handleProductClick(item) {
		selectedInventoryItem = item;
	}

	function closeEditModal() {
		selectedInventoryItem = null;
	}

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
</script>

<div class="p-8 max-w-7xl mx-auto">
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-gray-800 mb-6">Inventory Management</h1>

		<!-- Tabs -->
		<div class="border-b border-gray-200">
			<nav class="-mb-px flex space-x-8">
				<button
					onclick={() => activeTab = 'low-stock'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'low-stock' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					<span class="material-symbols-outlined text-base align-middle mr-1">warning</span>
					Low Stock Alerts
					{#if data.lowStockItems.length > 0}
						<span class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{data.lowStockItems.length}</span>
					{/if}
				</button>

				<button
					onclick={() => activeTab = 'browse'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'browse' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					<span class="material-symbols-outlined text-base align-middle mr-1">inventory_2</span>
					All Inventory
				</button>

				<button
					onclick={() => activeTab = 'manage'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'manage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					<span class="material-symbols-outlined text-base align-middle mr-1">add_circle</span>
					Manage Products
				</button>

				<button
					onclick={() => activeTab = 'adjust'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'adjust' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					<span class="material-symbols-outlined text-base align-middle mr-1">tune</span>
					Adjust Stock
				</button>
			</nav>
		</div>
	</div>

	<!-- Tab Content -->
	<div class="mt-6">
		{#if activeTab === 'low-stock'}
			<div class="bg-white p-6 rounded-lg shadow">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-800">Low Stock & Out of Stock Items</h2>
					{#if data.lowStockItems.length > 0}
						<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
							{data.lowStockItems.length} {data.lowStockItems.length === 1 ? 'item' : 'items'} need attention
						</span>
					{/if}
				</div>

				{#if data.lowStockItems.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full table-auto border-collapse">
							<thead>
								<tr class="bg-gray-200">
									<th class="border p-2 text-left font-bold">Product</th>
									<th class="border p-2 text-left font-bold">SKU</th>
									<th class="border p-2 text-left font-bold">Shop</th>
									<th class="border p-2 text-right font-bold">Current Stock</th>
									<th class="border p-2 text-right font-bold">Min Threshold</th>
									<th class="border p-2 text-center font-bold">Status</th>
									<th class="border p-2 text-center font-bold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each data.lowStockItems as item, i}
									<tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50 cursor-pointer transition-colors">
										<td class="border p-2" onclick={() => handleProductClick(item)}>{item.productName}</td>
										<td class="border p-2 text-gray-600" onclick={() => handleProductClick(item)}>{item.sku || 'N/A'}</td>
										<td class="border p-2 capitalize" onclick={() => handleProductClick(item)}>{item.shop}</td>
										<td class="border p-2 text-right font-semibold {item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'}" onclick={() => handleProductClick(item)}>{item.quantity}</td>
										<td class="border p-2 text-right" onclick={() => handleProductClick(item)}>{item.minThreshold}</td>
										<td class="border p-2 text-center" onclick={() => handleProductClick(item)}>
											<span class="px-2 py-1 rounded text-sm font-bold {getStatusColor(item.status)}">
												{getStatusText(item.status)}
											</span>
										</td>
										<td class="border p-2 text-center">
											<button
												onclick={() => handleProductClick(item)}
												class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
											>
												<span class="material-symbols-outlined text-sm">edit</span>
												Update Stock
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="text-center py-12">
						<span class="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
						<p class="text-xl text-gray-600 font-medium">All stock levels are healthy!</p>
						<p class="text-gray-500 mt-2">No items are below their minimum threshold.</p>
					</div>
				{/if}
			</div>

		{:else if activeTab === 'browse'}
			<InventoryTable
				inventory={data.inventory}
				{form}
				onProductClick={handleProductClick}
			/>
		{:else if activeTab === 'manage'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h2 class="text-2xl font-bold mb-6">Add New Product</h2>
				<AddProduct {form} fullWidth={true} />
			</div>
		{:else if activeTab === 'adjust'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h2 class="text-2xl font-bold mb-6">Adjust Stock Levels</h2>
				<AdjustStock inventory={data.inventory} {form} />
			</div>
		{/if}
	</div>
</div>

<!-- Edit Modal -->
{#if selectedInventoryItem}
	<EditInventory
		inventoryItem={selectedInventoryItem}
		{form}
		onClose={closeEditModal}
	/>
{/if}
