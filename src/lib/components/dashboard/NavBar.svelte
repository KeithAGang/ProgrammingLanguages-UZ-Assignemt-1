<script>
	import { page } from '$app/stores';

	let mobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard' },
		{ name: 'Sales', href: '/sales' },
		{ name: 'Inventory', href: '/inventory' },
		{ name: 'Payroll', href: '/payroll' },
		{ name: 'Credits', href: '/credits' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function isActive(href) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<nav class="bg-gray-800 sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo/Title -->
			<div class="flex items-center">
				<a href="/dashboard" class="text-white text-xl font-bold">
					Vincent's Business Hub
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					{#each navigation as item}
						<a
							href={item.href}
							class="px-3 py-2 rounded-md text-sm font-medium transition-colors
								{isActive(item.href)
									? 'bg-blue-600 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-md text-gray-400
						hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2
						focus:ring-inset focus:ring-white"
					aria-expanded={mobileMenuOpen}
				>
					<span class="sr-only">Open main menu</span>
					{#if mobileMenuOpen}
						<!-- X icon -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<!-- Hamburger icon -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden">
			<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
				{#each navigation as item}
					<a
						href={item.href}
						onclick={toggleMobileMenu}
						class="block px-3 py-2 rounded-md text-base font-medium
							{isActive(item.href)
								? 'bg-blue-600 text-white'
								: 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
					>
						{item.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
