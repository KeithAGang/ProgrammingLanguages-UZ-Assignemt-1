import { db } from '$lib/server/db/index.js';
import { employees, payroll } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	// Fetch all active employees
	const allEmployees = await db
		.select()
		.from(employees)
		.where(eq(employees.isActive, 1));

	// Separate full-time and runners
	const fullTime = allEmployees.filter((e) => e.employeeType === 'full-time');
	const runners = allEmployees.filter((e) => e.employeeType === 'runner');

	return {
		allEmployees,
		fullTime,
		runners
	};
}

export const actions = {
	saveEmployee: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const employeeType = formData.get('employeeType');
		const shop = formData.get('shop');
		const qualifications = formData.get('qualifications') || null;

		let baseSalary = null;
		let dailyRate = null;

		if (employeeType === 'full-time') {
			baseSalary = parseInt(formData.get('baseSalary'));
			if (!baseSalary || baseSalary < 200 || baseSalary > 900) {
				return fail(400, {
					error: 'Base salary must be between USD 200 and 900',
					success: false
				});
			}
		} else if (employeeType === 'runner') {
			dailyRate = parseFloat(formData.get('dailyRate'));
			if (!dailyRate || dailyRate <= 0) {
				return fail(400, { error: 'Valid daily rate required', success: false });
			}
		}

		if (!name || !employeeType || !shop) {
			return fail(400, { error: 'All required fields must be filled', success: false });
		}

		try {
			await db.insert(employees).values({
				name,
				employeeType,
				shop,
				baseSalary,
				dailyRate,
				qualifications
			});

			return { success: true, message: 'Employee added successfully!' };
		} catch (err) {
			console.error('Error adding employee:', err);
			return fail(500, { error: err.message, success: false });
		}
	},

	calculateMonthlyPayroll: async ({ request }) => {
		const formData = await request.formData();
		const employeeData = JSON.parse(formData.get('employeeData'));

		if (!employeeData || employeeData.length === 0) {
			return fail(400, { error: 'No employees selected', success: false });
		}

		try {
			const payrollRecords = employeeData.map((emp) => ({
				employeeId: emp.id,
				payPeriod: 'monthly',
				basePay: emp.baseSalary,
				transportAllowance: emp.transportAllowance,
				mealAllowance: emp.mealAllowance,
				uniformDeduction: emp.uniformDeduction,
				totalPay: emp.totalPay,
				isPaid: 0
			}));

			await db.insert(payroll).values(payrollRecords);

			return {
				success: true,
				message: 'Monthly payroll calculated and saved!',
				total: payrollRecords.length,
				action: 'calculateMonthlyPayroll'
			};
		} catch (err) {
			console.error('Error calculating payroll:', err);
			return fail(500, { error: err.message, success: false });
		}
	},

	calculateDailyPayroll: async ({ request }) => {
		const formData = await request.formData();
		const runnerData = JSON.parse(formData.get('runnerData'));

		if (!runnerData || runnerData.length === 0) {
			return fail(400, { error: 'No runners with days worked', success: false });
		}

		try {
			const payrollRecords = runnerData.map((runner) => ({
				employeeId: runner.id,
				payPeriod: 'daily',
				basePay: runner.basePay,
				transportAllowance: runner.transportAllowance,
				mealAllowance: runner.mealAllowance,
				uniformDeduction: 0,
				totalPay: runner.totalPay,
				isPaid: 0
			}));

			await db.insert(payroll).values(payrollRecords);

			return {
				success: true,
				message: 'Daily payroll calculated and saved!',
				action: 'calculateDailyPayroll'
			};
		} catch (err) {
			console.error('Error calculating daily payroll:', err);
			return fail(500, { error: err.message, success: false });
		}
	}
};
