<script>
	import EmployeeForm from '$lib/components/payroll/EmployeeForm.svelte';
	import PayrollCalculator from '$lib/components/payroll/PayrollCalculator.svelte';
	import DailyRunners from '$lib/components/payroll/DailyRunners.svelte';

	let { data, form } = $props();
</script>

<div class="p-8 max-w-7xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-gray-800">Payroll Management</h1>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
		<EmployeeForm {form} />

		<div class="bg-white p-6 rounded-lg shadow">
			<h2 class="text-2xl font-bold mb-4">Active Employees</h2>
			<div class="space-y-2 max-h-96 overflow-y-auto">
				{#each data.allEmployees as emp}
					<div class="p-3 border border-gray-200 rounded">
						<div class="font-semibold">{emp.name}</div>
						<div class="text-sm text-gray-600">
							{emp.employeeType === 'full-time' ? 'Full-time' : 'Runner'} •
							{emp.shop} •
							{emp.employeeType === 'full-time'
								? `$${emp.baseSalary}/month`
								: `$${emp.dailyRate}/day`}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="mb-6">
		<PayrollCalculator fullTimeEmployees={data.fullTime} {form} />
	</div>

	<div>
		<DailyRunners runners={data.runners} {form} />
	</div>
</div>
