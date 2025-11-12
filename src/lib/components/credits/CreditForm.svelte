<script>
	import { enhance } from '$app/forms';

	let { clients = [], form } = $props();

	let transactionType = $state('debit');
	let isNewClient = $state(false);

	function getDueDate() {
		const date = new Date();
		date.setDate(date.getDate() + 7);
		return date.toISOString().split('T')[0];
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Record Credit Transaction</h2>

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

	<form method="POST" action="?/recordTransaction" use:enhance>
		<div class="grid gap-4">
			<div>
				<label class="flex items-center mb-2">
					<input type="checkbox" bind:checked={isNewClient} class="mr-2" />
					<span class="text-sm font-medium text-gray-700">New Client</span>
				</label>

				{#if isNewClient}
					<input
						type="text"
						name="clientName"
						placeholder="Enter client name..."
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				{:else}
					<select
						name="clientName"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="">Select existing client...</option>
						{#each clients as client}
							<option value={client.clientName}>
								{client.clientName} (Balance: ${client.totalOwed.toFixed(2)})
							</option>
						{/each}
					</select>
				{/if}
			</div>

			<div>
				<label for="type" class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
				<select
					id="type"
					name="type"
					bind:value={transactionType}
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				>
					<option value="debit">New Sale (Debit)</option>
					<option value="payment">Payment Received</option>
				</select>
			</div>

			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount (USD) *</label>
				<input
					type="number"
					id="amount"
					name="amount"
					step="0.01"
					min="0.01"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				/>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
					Description (Optional)
				</label>
				<textarea
					id="description"
					name="description"
					rows="2"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			{#if transactionType === 'debit'}
				<div>
					<label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
					<input
						type="date"
						id="dueDate"
						name="dueDate"
						value={getDueDate()}
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			{/if}

			<button
				type="submit"
				class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded transition-colors"
			>
				Record Transaction
			</button>
		</div>
	</form>
</div>
