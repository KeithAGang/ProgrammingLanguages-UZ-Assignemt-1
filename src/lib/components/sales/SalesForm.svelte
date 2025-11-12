<script>
	import { enhance } from '$app/forms';

	let { products = [], form } = $props();

	let selectedProduct = $state(null);
	let quantity = $state(1);
	let shop = $state('grocery');
	let notes = $state('');

	let totalAmount = $derived(
		selectedProduct ? (selectedProduct.unitPrice * quantity).toFixed(2) : '0.00'
	);

	function handleProductChange(event) {
		const productId = parseInt(event.target.value);
		selectedProduct = products.find((p) => p.id === productId) || null;
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Record Sale</h2>

	{#if form?.success}
		<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/recordSale" use:enhance>
		<div class="grid gap-4">
			<div>
				<label for="shop" class="block text-sm font-medium text-gray-700 mb-1">Shop</label>
				<select
					id="shop"
					name="shop"
					bind:value={shop}
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				>
					<option value="grocery">Grocery</option>
					<option value="hardware">Hardware</option>
				</select>
			</div>

			<div>
				<label for="product" class="block text-sm font-medium text-gray-700 mb-1">Product</label>
				<select
					id="product"
					name="productId"
					onchange={handleProductChange}
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				>
					<option value="">Select a product...</option>
					{#each products as product}
						<option value={product.id}>
							{product.name} - ${product.unitPrice.toFixed(2)}
							{product.sku ? `(${product.sku})` : ''}
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
				<input
					type="number"
					id="quantity"
					name="quantity"
					bind:value={quantity}
					min="1"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				/>
			</div>

			{#if selectedProduct}
				<div class="bg-gray-50 p-4 rounded">
					<div class="flex justify-between mb-2">
						<span class="text-gray-600">Unit Price:</span>
						<span class="font-semibold">${selectedProduct.unitPrice.toFixed(2)}</span>
					</div>
					<div class="flex justify-between text-lg font-bold">
						<span>Total Amount:</span>
						<span class="text-blue-600">${totalAmount}</span>
					</div>
				</div>
			{/if}

			<div>
				<label for="notes" class="block text-sm font-medium text-gray-700 mb-1"
					>Notes (Optional)</label
				>
				<textarea
					id="notes"
					name="notes"
					bind:value={notes}
					rows="2"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			<button
				type="submit"
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors"
			>
				Record Sale
			</button>
		</div>
	</form>
</div>
