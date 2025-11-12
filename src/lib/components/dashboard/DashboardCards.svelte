<script>
	let { todaysSales = 0, outstandingCredit = 0, payrollDue = 0, lowStockCount = 0 } = $props();

	const cards = $derived([
		{
			label: "Today's Sales",
			value: `$${todaysSales.toFixed(2)}`,
			color: 'blue',
			icon: 'attach_money'
		},
		{
			label: 'Outstanding Credit',
			value: `$${outstandingCredit.toFixed(2)}`,
			color: 'purple',
			icon: 'credit_card'
		},
		{
			label: 'Payroll Due',
			value: `$${payrollDue.toFixed(2)}`,
			color: 'yellow',
			icon: 'group'
		},
		{
			label: 'Low Stock Items',
			value: lowStockCount.toString(),
			color: lowStockCount > 0 ? 'red' : 'green',
			icon: 'inventory_2'
		}
	]);

	function getColorClasses(color) {
		const colors = {
			blue: 'border-blue-500 bg-blue-50',
			purple: 'border-purple-500 bg-purple-50',
			yellow: 'border-yellow-500 bg-yellow-50',
			red: 'border-red-500 bg-red-50',
			green: 'border-green-500 bg-green-50'
		};
		return colors[color] || colors.blue;
	}

	function getValueColor(color) {
		const colors = {
			blue: 'text-blue-600',
			purple: 'text-purple-600',
			yellow: 'text-yellow-600',
			red: 'text-red-600',
			green: 'text-green-600'
		};
		return colors[color] || colors.blue;
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
	{#each cards as card}
		<div
			class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 {getColorClasses(
				card.color
			)}"
		>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium mb-2">{card.label}</p>
					<p class="text-3xl font-bold {getValueColor(card.color)}">{card.value}</p>
				</div>
				<span class="material-symbols-outlined text-5xl opacity-50 {getValueColor(card.color)}">
					{card.icon}
				</span>
			</div>
		</div>
	{/each}
</div>
