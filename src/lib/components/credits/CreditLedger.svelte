<script>
	let { clients = [], transactions = [] } = $props();

	let selectedClientId = $state(null);

	let selectedClient = $derived(clients.find((c) => c.id === selectedClientId) || null);

	let clientTransactions = $derived(
		transactions.filter((t) => t.creditId === selectedClientId).sort((a, b) => b.transactionDate - a.transactionDate)
	);

	function formatDate(timestamp) {
		if (!timestamp) return 'N/A';
		const date = new Date(timestamp * 1000);
		return date.toLocaleDateString('en-US');
	}

	function getDaysOverdue(dueDate) {
		if (!dueDate) return 0;
		const today = new Date();
		const due = new Date(dueDate * 1000);
		const diffTime = today - due;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	}

	function getUrgencyStatus(client) {
		if (!client || !client.totalOwed || client.totalOwed <= 0) return 'paid';

		const latestDebit = transactions
			.filter((t) => t.creditId === client.id && t.type === 'debit' && t.dueDate)
			.sort((a, b) => b.dueDate - a.dueDate)[0];

		if (!latestDebit) return 'current';

		const daysOverdue = getDaysOverdue(latestDebit.dueDate);
		if (daysOverdue > 30) return 'critical';
		if (daysOverdue > 7) return 'warning';
		return 'current';
	}

	function getStatusColor(status) {
		if (status === 'critical') return 'bg-red-100 text-red-800 border-red-500';
		if (status === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-500';
		if (status === 'paid') return 'bg-green-100 text-green-800 border-green-500';
		return 'bg-blue-100 text-blue-800 border-blue-500';
	}

	function getStatusText(status) {
		if (status === 'critical') return 'Overdue >30 days';
		if (status === 'warning') return 'Overdue >7 days';
		if (status === 'paid') return 'Paid';
		return 'Current';
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Credit Ledger</h2>

	<div class="mb-6">
		<label for="clientSelect" class="block text-sm font-medium text-gray-700 mb-1">
			Select Client
		</label>
		<select
			id="clientSelect"
			bind:value={selectedClientId}
			class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
		>
			<option value={null}>Choose a client...</option>
			{#each clients as client}
				{@const status = getUrgencyStatus(client)}
				<option value={client.id}>
					{client.clientName} - ${client.totalOwed.toFixed(2)} ({getStatusText(status)})
				</option>
			{/each}
		</select>
	</div>

	{#if selectedClient}
		<div class="mb-6 p-4 border-l-4 rounded {getStatusColor(getUrgencyStatus(selectedClient))}">
			<div class="flex justify-between items-start">
				<div>
					<h3 class="text-xl font-bold">{selectedClient.clientName}</h3>
					<p class="text-sm text-gray-600">{selectedClient.clientType}</p>
				</div>
				<div class="text-right">
					<div class="text-sm text-gray-600">Total Owed</div>
					<div class="text-3xl font-bold">
						${selectedClient.totalOwed.toFixed(2)}
					</div>
				</div>
			</div>
			<div class="mt-2">
				<span class="px-2 py-1 rounded text-sm font-bold {getStatusColor(getUrgencyStatus(selectedClient))}">
					{getStatusText(getUrgencyStatus(selectedClient))}
				</span>
			</div>
		</div>

		<h3 class="text-lg font-bold mb-4">Transaction History</h3>
		{#if clientTransactions.length === 0}
			<p class="text-gray-500 text-center py-8">No transactions found</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full table-auto border-collapse">
					<thead>
						<tr class="bg-gray-200">
							<th class="border p-2 text-left font-bold">Date</th>
							<th class="border p-2 text-left font-bold">Type</th>
							<th class="border p-2 text-right font-bold">Amount</th>
							<th class="border p-2 text-left font-bold">Description</th>
							<th class="border p-2 text-left font-bold">Due Date</th>
						</tr>
					</thead>
					<tbody>
						{#each clientTransactions as txn, i}
							<tr class={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
								<td class="border p-2">{formatDate(txn.transactionDate)}</td>
								<td class="border p-2">
									<span
										class="px-2 py-1 rounded text-xs font-bold {txn.type === 'debit'
											? 'bg-red-100 text-red-800'
											: 'bg-green-100 text-green-800'}"
									>
										{txn.type === 'debit' ? 'Sale' : 'Payment'}
									</span>
								</td>
								<td class="border p-2 text-right font-semibold">
									{txn.type === 'debit' ? '+' : '-'}${txn.amount.toFixed(2)}
								</td>
								<td class="border p-2 text-gray-600">{txn.description || 'N/A'}</td>
								<td class="border p-2">{txn.dueDate ? formatDate(txn.dueDate) : 'N/A'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
