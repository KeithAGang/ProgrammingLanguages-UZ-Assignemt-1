<script>
	import { enhance } from '$app/forms';

	let { form, fullWidth = false } = $props();

	let showModal = $state(false);
</script>

{#if !fullWidth}
	<div>
		<button
			onclick={() => (showModal = true)}
			class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
		>
			+ Add New Product
		</button>

		{#if showModal}
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-xl font-bold">Add New Product</h3>
						<button
							onclick={() => (showModal = false)}
							class="text-gray-500 hover:text-gray-700 text-2xl"
						>
							×
						</button>
					</div>

					{#if form?.success}
						<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
							{form.message}
						</div>
					{/if}

					{#if form?.error}
						<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
							{form.error}
						</div>
					{/if}

					<form method="POST" action="?/addProduct" use:enhance>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
							<input
								type="text"
								id="name"
								name="name"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
							<input
								type="text"
								id="sku"
								name="sku"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
							<select
								id="category"
								name="category"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
								required
							>
								<option value="grocery">Grocery</option>
								<option value="spare-parts">Spare Parts</option>
							</select>
						</div>

						<div>
							<label for="unitPrice" class="block text-sm font-medium text-gray-700 mb-1">Unit Price (USD) *</label>
							<input
								type="number"
								id="unitPrice"
								name="unitPrice"
								step="0.01"
								min="0.01"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label for="minThreshold" class="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Threshold</label>
							<input
								type="number"
								id="minThreshold"
								name="minThreshold"
								min="0"
								value="5"
								class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div class="flex gap-2">
							<button
								type="submit"
								class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
							>
								Add Product
							</button>
							<button
								type="button"
								onclick={() => (showModal = false)}
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
{:else}
	<!-- Full width form (no modal) -->
	<div>
		{#if form?.success}
			<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
				{form.message}
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
				{form.error}
			</div>
		{/if}

		<form method="POST" action="?/addProduct" use:enhance>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="name-full" class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
					<input
						type="text"
						id="name-full"
						name="name"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label for="sku-full" class="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
					<input
						type="text"
						id="sku-full"
						name="sku"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="category-full" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
					<select
						id="category-full"
						name="category"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="grocery">Grocery</option>
						<option value="spare-parts">Spare Parts</option>
					</select>
				</div>

				<div>
					<label for="unitPrice-full" class="block text-sm font-medium text-gray-700 mb-1">Unit Price (USD) *</label>
					<input
						type="number"
						id="unitPrice-full"
						name="unitPrice"
						step="0.01"
						min="0.01"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label for="minThreshold-full" class="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Threshold</label>
					<input
						type="number"
						id="minThreshold-full"
						name="minThreshold"
						min="0"
						value="5"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div class="mt-6">
				<button
					type="submit"
					class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors"
				>
					Add Product
				</button>
			</div>
		</form>
	</div>
{/if}
