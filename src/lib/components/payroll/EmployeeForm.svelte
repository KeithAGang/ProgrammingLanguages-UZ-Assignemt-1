<script>
	import { enhance } from '$app/forms';

	let { form } = $props();

	let employeeType = $state('full-time');
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h2 class="text-2xl font-bold mb-6">Add Employee</h2>

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

	<form method="POST" action="?/saveEmployee" use:enhance>
		<div class="grid gap-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
				<input
					type="text"
					id="name"
					name="name"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				/>
			</div>

			<div>
				<label for="employeeType" class="block text-sm font-medium text-gray-700 mb-1">Employee Type *</label>
				<select
					id="employeeType"
					name="employeeType"
					bind:value={employeeType}
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				>
					<option value="full-time">Full-time</option>
					<option value="runner">Runner (Daily)</option>
				</select>
			</div>

			<div>
				<label for="shop" class="block text-sm font-medium text-gray-700 mb-1">Shop</label>
				<select
					id="shop"
					name="shop"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
					required
				>
					<option value="grocery">Grocery</option>
					<option value="hardware">Hardware</option>
					<option value="both">Both</option>
				</select>
			</div>

			{#if employeeType === 'full-time'}
				<div>
					<label for="baseSalary" class="block text-sm font-medium text-gray-700 mb-1">
						Monthly Salary (USD 200-900) *
					</label>
					<input
						type="number"
						id="baseSalary"
						name="baseSalary"
						min="200"
						max="900"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
			{:else}
				<div>
					<label for="dailyRate" class="block text-sm font-medium text-gray-700 mb-1">
						Daily Rate (USD) *
					</label>
					<input
						type="number"
						id="dailyRate"
						name="dailyRate"
						step="0.01"
						min="1"
						class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
			{/if}

			<div>
				<label for="qualifications" class="block text-sm font-medium text-gray-700 mb-1">
					Qualifications (Optional)
				</label>
				<textarea
					id="qualifications"
					name="qualifications"
					rows="2"
					class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			<button
				type="submit"
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors"
			>
				Add Employee
			</button>
		</div>
	</form>
</div>
