<script>
	import { enhance } from '$app/forms';

	let { inventoryItem, form, onClose } = $props();

	let quantity = $state(inventoryItem.quantity);
	let minThreshold = $state(inventoryItem.minThreshold);
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
	<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
		<div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
			<h2 class="text-2xl font-bold text-gray-800">Edit Inventory</h2>
			<button
				onclick={onClose}
				class="text-gray-400 hover:text-gray-600 transition-colors"
			>
				<span class="material-symbols-outlined text-3xl">close</span>
			</button>
		</div>

		<div class="p-6">
			<!-- Product Information (Read-only) -->
			<div class="bg-gray-50 p-4 rounded-lg mb-6">
				<h3 class="font-semibold text-lg mb-3 text-gray-700">Product Information</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-500">Product Name</p>
						<p class="font-medium">{inventoryItem.productName}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">SKU</p>
						<p class="font-medium">{inventoryItem.sku || 'N/A'}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Shop</p>
						<p class="font-medium capitalize">{inventoryItem.shop}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Status</p>
						<p class="font-medium">
							{#if inventoryItem.status === 'out-of-stock'}
								<span class="px-2 py-1 rounded text-sm bg-red-100 text-red-800">Out of Stock</span>
							{:else if inventoryItem.status === 'low'}
								<span class="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">Low Stock</span>
							{:else}
								<span class="px-2 py-1 rounded text-sm bg-green-100 text-green-800">OK</span>
							{/if}
						</p>
					</div>
				</div>
			</div>

			<!-- Edit Form -->
			<form
				method="POST"
				action="?/updateInventory"
				use:enhance={() => {
					return async ({ update, result }) => {
						await update();
						if (result.type === 'success') {
							onClose();
						}
					};
				}}
			>
				<input type="hidden" name="inventoryId" value={inventoryItem.id} />

				<div class="space-y-4">
					<div>
						<label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
							Quantity
						</label>
						<input
							type="number"
							id="quantity"
							name="quantity"
							bind:value={quantity}
							min="0"
							required
							class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						/>
						<p class="text-xs text-gray-500 mt-1">Current: {inventoryItem.quantity}</p>
					</div>

					<div>
						<label for="minThreshold" class="block text-sm font-medium text-gray-700 mb-1">
							Minimum Threshold
						</label>
						<input
							type="number"
							id="minThreshold"
							name="minThreshold"
							bind:value={minThreshold}
							min="0"
							required
							class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						/>
						<p class="text-xs text-gray-500 mt-1">Current: {inventoryItem.minThreshold}</p>
					</div>

					{#if form?.error}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{form.error}
						</div>
					{/if}

					{#if form?.success}
						<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
							{form.message}
						</div>
					{/if}
				</div>

				<div class="flex gap-3 mt-6 pt-4 border-t border-gray-200">
					<button
						type="button"
						onclick={onClose}
						class="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
