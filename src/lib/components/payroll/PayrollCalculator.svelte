<script>
	import { enhance } from '$app/forms';

	let { fullTimeEmployees = [], form } = $props();

	let selectedEmployees = $state([]);
	let uniformDeductions = $state([]);

	const TRANSPORT_ALLOWANCE = 50;
	const MEAL_ALLOWANCE = 25;
	const UNIFORM_COST = 30;

	let calculations = $derived(
		fullTimeEmployees
			.filter((emp) => selectedEmployees.includes(emp.id))
			.map((emp) => ({
				...emp,
				transportAllowance: TRANSPORT_ALLOWANCE,
				mealAllowance: MEAL_ALLOWANCE,
				uniformDeduction: uniformDeductions.includes(emp.id) ? UNIFORM_COST : 0,
				totalPay:
					emp.baseSalary +
					TRANSPORT_ALLOWANCE +
					MEAL_ALLOWANCE -
					(uniformDeductions.includes(emp.id) ? UNIFORM_COST : 0)
			}))
	);

	let grandTotal = $derived(calculations.reduce((sum, emp) => sum + emp.totalPay, 0));

	function toggleEmployee(empId) {
		if (selectedEmployees.includes(empId)) {
			selectedEmployees = selectedEmployees.filter((id) => id !== empId);
		} else {
			selectedEmployees = [...selectedEmployees, empId];
		}
	}

	function toggleUniform(empId) {
		if (uniformDeductions.includes(empId)) {
			uniformDeductions = uniformDeductions.filter((id) => id !== empId);
		} else {
			uniformDeductions = [...uniformDeductions, empId];
		}
	}

	function selectAll() {
		selectedEmployees = fullTimeEmployees.map((e) => e.id);
	}
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Monthly Payroll Calculator</h2>

	{#if form?.success && form?.action === 'calculateMonthlyPayroll'}
		<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
			{form.message} ({form.total} employees)
		</div>
	{/if}

	<div class="mb-4">
		<button
			onclick={selectAll}
			class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
		>
			Select All
		</button>
	</div>

	<div class="overflow-x-auto mb-4">
		<table class="w-full table-auto border-collapse text-sm">
			<thead>
				<tr class="bg-gray-200">
					<th class="border p-2 text-left">Select</th>
					<th class="border p-2 text-left">Name</th>
					<th class="border p-2 text-right">Base</th>
					<th class="border p-2 text-right">Transport</th>
					<th class="border p-2 text-right">Meal</th>
					<th class="border p-2 text-center">Uniform</th>
					<th class="border p-2 text-right font-bold">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each fullTimeEmployees as emp}
					<tr class={selectedEmployees.includes(emp.id) ? 'bg-blue-50' : 'bg-white'}>
						<td class="border p-2">
							<input
								type="checkbox"
								checked={selectedEmployees.includes(emp.id)}
								onchange={() => toggleEmployee(emp.id)}
								class="w-4 h-4"
							/>
						</td>
						<td class="border p-2">{emp.name}</td>
						<td class="border p-2 text-right">${emp.baseSalary}</td>
						<td class="border p-2 text-right">${TRANSPORT_ALLOWANCE}</td>
						<td class="border p-2 text-right">${MEAL_ALLOWANCE}</td>
						<td class="border p-2 text-center">
							{#if selectedEmployees.includes(emp.id)}
								<input
									type="checkbox"
									checked={uniformDeductions.includes(emp.id)}
									onchange={() => toggleUniform(emp.id)}
									class="w-4 h-4"
								/>
							{/if}
						</td>
						<td class="border p-2 text-right font-semibold">
							{#if selectedEmployees.includes(emp.id)}
								${emp.baseSalary +
									TRANSPORT_ALLOWANCE +
									MEAL_ALLOWANCE -
									(uniformDeductions.includes(emp.id) ? UNIFORM_COST : 0)}
							{/if}
						</td>
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

	{#if calculations.length > 0}
		<form method="POST" action="?/calculateMonthlyPayroll" use:enhance>
			<input type="hidden" name="employeeData" value={JSON.stringify(calculations)} />
			<button
				type="submit"
				class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors"
			>
				Confirm and Save Payroll (${grandTotal.toFixed(2)})
			</button>
		</form>
	{/if}
</div>
