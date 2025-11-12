<script>
	import DashboardCards from '$lib/components/dashboard/DashboardCards.svelte';

	let { data } = $props();
</script>

<div class="p-8 max-w-7xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>

	<DashboardCards
		todaysSales={data.todaysSales}
		outstandingCredit={data.outstandingCredit}
		payrollDue={data.payrollDue}
		lowStockCount={data.lowStockCount}
	/>

	<div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<a
			href="/sales"
			class="block p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center shadow-lg"
		>
			<span class="material-symbols-outlined text-5xl mb-2">point_of_sale</span>
			<div class="font-bold text-lg">Record Sale</div>
			<div class="text-sm opacity-90 mt-1">Track transactions</div>
		</a>

		<a
			href="/inventory"
			class="block p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center shadow-lg"
		>
			<span class="material-symbols-outlined text-5xl mb-2">inventory</span>
			<div class="font-bold text-lg">Check Stock</div>
			<div class="text-sm opacity-90 mt-1">Manage inventory</div>
		</a>

		<a
			href="/payroll"
			class="block p-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center shadow-lg"
		>
			<span class="material-symbols-outlined text-5xl mb-2">payments</span>
			<div class="font-bold text-lg">Payroll</div>
			<div class="text-sm opacity-90 mt-1">Calculate wages</div>
		</a>

		<a
			href="/credits"
			class="block p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center shadow-lg"
		>
			<span class="material-symbols-outlined text-5xl mb-2">account_balance</span>
			<div class="font-bold text-lg">Credits</div>
			<div class="text-sm opacity-90 mt-1">Track B2B clients</div>
		</a>
	</div>
</div>
