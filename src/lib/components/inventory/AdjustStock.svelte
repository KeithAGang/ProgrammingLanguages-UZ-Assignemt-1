<script>
	import { enhance } from '$app/forms';

	let { inventory = [], form } = $props();

	let showModal = $state(false);
	let selectedInventoryId = $state(null);
	let adjustmentType = $state('add');
	let adjustmentQuantity = $state(0);

	let selectedItem = $derived(inventory.find((item) => item.id === selectedInventoryId) || null);

	function openModal(inventoryId) {
		selectedInventoryId = inventoryId;
		adjustmentType = 'add';
		adjustmentQuantity = 0;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedInventoryId = null;
		adjustmentQuantity = 0;
	}
</script>

<div>
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="px-6 py-4 bg-gray-50 border-b">
			<h3 class="text-lg font-bold">Quick Stock Adjustments</h3>
		</div>

		<div class="max-h-96 overflow-y-auto">
			<table class="w-full">
				<thead class="bg-gray-100 sticky top-0">
					<tr>
						<th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
						<th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Shop</th>
						<th class="px-4 py-2 text-right text-sm font-medium text-gray-700">Stock</th>
						<th class="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each inventory as item}
						<tr class="border-t hover:bg-gray-50">
							<td class="px-4 py-2 text-sm">{item.productName}</td>
							<td class="px-4 py-2 text-sm capitalize">{item.shop}</td>
							<td class="px-4 py-2 text-sm text-right font-semibold">{item.quantity}</td>
							<td class="px-4 py-2 text-center">
								<button
									onclick={() => openModal(item.id)}
									class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
								>
									<span class="material-symbols-outlined text-sm">add</span>
									Adjust
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	{#if showModal && selectedItem}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-xl font-bold">Adjust Stock</h3>
					<button onclick={closeModal} class="text-gray-500 hover:text-gray-700 text-2xl">
						×
					</button>
				</div>

				<div class="mb-4 p-4 bg-gray-50 rounded">
					<div class="font-semibold">{selectedItem.productName}</div>
					<div class="text-sm text-gray-600 mt-1">
						Shop: <span class="capitalize">{selectedItem.shop}</span>
					</div>
					<div class="text-sm text-gray-600">Current Stock: {selectedItem.quantity}</div>
				</div>

				{#if form?.success && form?.adjustedId === selectedInventoryId}
					<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
						{form.message}
					</div>
				{/if}

				{#if form?.error}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
						{form.error}
					</div>
				{/if}

				<form method="POST" action="?/adjustStock" use:enhance>
					<input type="hidden" name="inventoryId" value={selectedInventoryId} />

					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Adjustment Type
							</label>
							<div class="grid grid-cols-2 gap-2">
								<button
									type="button"
									onclick={() => (adjustmentType = 'add')}
									class="px-4 py-2 rounded border {adjustmentType === 'add'
										? 'bg-green-500 text-white border-green-600'
										: 'bg-white text-gray-700 border-gray-300'}"
								>
									<span class="material-symbols-outlined text-sm">add</span>
									Add Stock
								</button>
								<button
									type="button"
									onclick={() => (adjustmentType = 'remove')}
									class="px-4 py-2 rounded border {adjustmentType === 'remove'
										? 'bg-red-500 text-white border-red-600'
										: 'bg-white text-gray-700 border-gray-300'}"
								>
									<span class="material-symbols-outlined text-sm">remove</span>
									Remove Stock
								</button>
							</div>
							<input type="hidden" name="adjustmentType" value={adjustmentType} />
						</div>

						<div>
							<label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
								Quantity
							</label>
							<input
								type="number"
								id="quantity"
								name="quantity"
								bind:value={adjustmentQuantity}
								min="1"
								max={adjustmentType === 'remove' ? selectedItem.quantity : 10000}
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
								Reason (Optional)
							</label>
							<textarea
								id="reason"
								name="reason"
								rows="2"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
								placeholder="E.g., New shipment arrived, Damaged goods, etc."
							></textarea>
						</div>

						<div class="bg-blue-50 p-3 rounded">
							<div class="text-sm text-gray-700">
								New stock will be:
								<span class="font-bold text-blue-600">
									{adjustmentType === 'add'
										? selectedItem.quantity + adjustmentQuantity
										: selectedItem.quantity - adjustmentQuantity}
								</span>
							</div>
						</div>

						<div class="flex gap-2">
							<button
								type="submit"
								class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
							>
								Confirm Adjustment
							</button>
							<button
								type="button"
								onclick={closeModal}
								class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
