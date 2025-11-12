<script>
	import { enhance } from '$app/forms';

	let { runners = [], form } = $props();

	const TRANSPORT_ALLOWANCE = 50;
	const MEAL_ALLOWANCE = 25;

	let runnerDays = $state({});

	runners.forEach((runner) => {
		if (!runnerDays[runner.id]) {
			runnerDays[runner.id] = 0;
		}
	});

	let calculations = $derived(
		runners.map((runner) => {
			const daysWorked = runnerDays[runner.id] || 0;
			const basePay = runner.dailyRate * daysWorked;
			const totalPay = basePay + TRANSPORT_ALLOWANCE + MEAL_ALLOWANCE;
			return {
				...runner,
				daysWorked,
				basePay,
				transportAllowance: TRANSPORT_ALLOWANCE,
				mealAllowance: MEAL_ALLOWANCE,
				totalPay
			};
		})
	);

	let grandTotal = $derived(calculations.reduce((sum, runner) => sum + runner.totalPay, 0));

	function updateDays(runnerId, days) {
		runnerDays[runnerId] = parseInt(days) || 0;
		runnerDays = runnerDays;
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Daily Runners Payroll</h2>

	{#if form?.success && form?.action === 'calculateDailyPayroll'}
		<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
			{form.message}
		</div>
	{/if}

	<div class="overflow-x-auto mb-4">
		<table class="w-full table-auto border-collapse text-sm">
			<thead>
				<tr class="bg-gray-200">
					<th class="border p-2 text-left">Name</th>
					<th class="border p-2 text-right">Daily Rate</th>
					<th class="border p-2 text-center">Days Worked</th>
					<th class="border p-2 text-right">Base Pay</th>
					<th class="border p-2 text-right">Transport</th>
					<th class="border p-2 text-right">Meal</th>
					<th class="border p-2 text-right font-bold">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each runners as runner}
					{@const calc = calculations.find((c) => c.id === runner.id)}
					<tr class="bg-white">
						<td class="border p-2">{runner.name}</td>
						<td class="border p-2 text-right">${runner.dailyRate.toFixed(2)}</td>
						<td class="border p-2 text-center">
							<input
								type="number"
								min="0"
								max="31"
								value={runnerDays[runner.id] || 0}
								oninput={(e) => updateDays(runner.id, e.target.value)}
								class="w-20 border border-gray-300 rounded p-1 text-center"
							/>
						</td>
						<td class="border p-2 text-right">${calc.basePay.toFixed(2)}</td>
						<td class="border p-2 text-right">${TRANSPORT_ALLOWANCE}</td>
						<td class="border p-2 text-right">${MEAL_ALLOWANCE}</td>
						<td class="border p-2 text-right font-semibold">${calc.totalPay.toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="bg-blue-100">
					<td colspan="6" class="border p-2 text-right font-bold">Grand Total:</td>
					<td class="border p-2 text-right font-bold text-lg">${grandTotal.toFixed(2)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	{#if calculations.some((c) => c.daysWorked > 0)}
		<form method="POST" action="?/calculateDailyPayroll" use:enhance>
			<input
				type="hidden"
				name="runnerData"
				value={JSON.stringify(calculations.filter((c) => c.daysWorked > 0))}
			/>
			<button
				type="submit"
				class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors"
			>
				Save Daily Payroll (${grandTotal.toFixed(2)})
			</button>
		</form>
	{/if}
</div>
