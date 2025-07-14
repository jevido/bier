<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Slider } from '$lib/components/ui/slider';
	import * as Select from '$lib/components/ui/select';

	import { Search, SortAsc, ExternalLink, Calendar, ListFilterPlus } from '@lucide/svelte';

	let { data } = $props();

	// browser
	const beers = data.beers;

	// State
	let searchTerm = $state('');
	let sortBy = $state('title');
	let sortOrder = $state('asc');
	let priceRange = $state([0, 20]);
	let currentPage = $state(1);
	let itemsPerPage = $state(24);

	// Options
	const sortByOptions = [
		{ value: 'title', label: 'Name' },
		{ value: 'price', label: 'Price' },
		{ value: 'createdAt', label: 'Date Added' }
	];

	const itemsPerPageOptions = [
		{ value: 12, label: '12' },
		{ value: 24, label: '24' },
		{ value: 48, label: '48' },
		{ value: 96, label: '96' }
	];

	let sortBySelectedValue = $derived(
		sortByOptions.find((f) => f.value === sortBy)?.label ?? 'Sort by'
	);
	let itemsPerPageSelectedValue = $derived(
		itemsPerPageOptions.find((f) => f.value === itemsPerPage)?.label ?? 'Items per page'
	);

	// Derived computations
	const filteredAndSortedBeers = $derived.by(() => {
		const filtered = beers.filter((beer) => {
			const matchesSearch = beer.title.toLowerCase().includes(searchTerm.toLowerCase());
			const price = parseFloat(beer.price);
			const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
			return matchesSearch && matchesPrice;
		});

		filtered.sort((a, b) => {
			let aVal, bVal;
			if (sortBy === 'price') {
				aVal = parseFloat(a.price);
				bVal = parseFloat(b.price);
			} else if (sortBy === 'createdAt') {
				aVal = new Date(a.createdAt).getTime();
				bVal = new Date(b.createdAt).getTime();
			} else {
				aVal = a.title.toLowerCase();
				bVal = b.title.toLowerCase();
			}

			return sortOrder === 'asc'
				? aVal < bVal
					? -1
					: aVal > bVal
						? 1
						: 0
				: aVal > bVal
					? -1
					: aVal < bVal
						? 1
						: 0;
		});

		return filtered;
	});

	const totalPages = $derived(Math.ceil(filteredAndSortedBeers.length / itemsPerPage));
	const paginatedBeers = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedBeers.slice(start, start + itemsPerPage);
	});

	const stats = (() => {
		const avg = beers.reduce((s, b) => s + parseFloat(b.price), 0) / beers.length;
		const min = Math.min(...beers.map((b) => parseFloat(b.price)));
		const max = Math.max(...beers.map((b) => parseFloat(b.price)));
		return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2) };
	})();
</script>

<svelte:head>
	<title>BIER!</title>
</svelte:head>

<div class="bg-background min-h-screen">
	<!-- Header -->
	<div class="bg-card border-b">
		<div class="container mx-auto px-4 py-6">
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold">Beer Browser</h1>
						<p class="text-muted-foreground">
							Browse {beers.length.toLocaleString()} beers from Drank Gigant
						</p>
					</div>
					<div class="flex gap-4 text-sm">
						<div class="text-center">
							<div class="font-semibold">€{stats.avg}</div>
							<div class="text-muted-foreground">Avg Price</div>
						</div>
						<div class="text-center">
							<div class="font-semibold">€{stats.min} - €{stats.max}</div>
							<div class="text-muted-foreground">Price Range</div>
						</div>
					</div>
				</div>

				<!-- Search + filters -->
				<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
					<div class="relative max-w-md flex-1">
						<Search
							class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
						/>
						<Input placeholder="Search beers..." bind:value={searchTerm} class="pl-10" />
					</div>

					<div class="flex flex-wrap gap-2">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button class="w-36" variant="outline" size="sm" {...props}>
										<ListFilterPlus class="mr-2 h-4 w-4" />
										Price: €{priceRange[0]} - €{priceRange[1]}
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-80">
								<div class="px-3 py-2">
									<Slider bind:value={priceRange} max={stats.max} step={0.5} class="w-full" />
									<div class="text-muted-foreground mt-2 flex justify-between text-sm">
										<span>€0</span><span>€{stats.max}</span>
									</div>
								</div>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<Select.Root type="single" bind:value={sortBy}>
							<Select.Trigger class="w-[180px]">{sortBySelectedValue}</Select.Trigger>
							<Select.Content>
								{#each sortByOptions as option}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Button
							variant="outline"
							size="sm"
							onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
						>
							<SortAsc class={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
						</Button>

						<Select.Root type="single" bind:value={itemsPerPage}>
							<Select.Trigger class="w-[180px]">{itemsPerPageSelectedValue}</Select.Trigger>
							<Select.Content>
								{#each itemsPerPageOptions as option}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<!-- Results -->
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>
						Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(
							currentPage * itemsPerPage,
							filteredAndSortedBeers.length
						)}
						of {filteredAndSortedBeers.length.toLocaleString()} beers
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Beer Grid -->
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{#each paginatedBeers as beer}
				<Card.Root
					class="group flex h-full flex-col justify-between transition-shadow hover:shadow-lg"
				>
					<div>
						<Card.Header class="p-4 pb-2">
							<div class="bg-muted relative aspect-square overflow-hidden rounded-md">
								<img
									src={beer.img}
									alt={beer.title}
									class="h-full w-full object-contain transition-transform group-hover:scale-105"
								/>
							</div>
						</Card.Header>
						<Card.Content class="p-4 pt-2">
							<h3 class="mb-2 line-clamp-2 text-sm font-semibold">{beer.title}</h3>
							<div class="text-muted-foreground mb-2 flex items-center justify-between text-sm">
								<span class="flex items-center gap-1">€{beer.price}</span>
								<span class="flex items-center gap-1">
									<Calendar class="h-3 w-3" />{new Date(beer.createdAt).toLocaleDateString()}
								</span>
							</div>
						</Card.Content>
					</div>
					<Card.Footer class="mt-auto p-4 pt-0">
						<Button
							href={beer.link}
							target="_blank"
							rel="noopener noreferrer"
							size="sm"
							class="w-full"
						>
							View Product <ExternalLink class="ml-2" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-2">
				<Button
					variant="outline"
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					Previous
				</Button>

				<div class="flex gap-1">
					{#each Array(Math.min(5, totalPages))
						.fill(0)
						.map((_, i) => {
							let pageNum;
							if (totalPages <= 5) {
								pageNum = i + 1;
							} else if (currentPage <= 3) {
								pageNum = i + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}
							return pageNum;
						}) as pageNum}
						<Button
							variant={currentPage === pageNum ? 'default' : 'outline'}
							size="sm"
							onclick={() => (currentPage = pageNum)}
						>
							{pageNum}
						</Button>
					{/each}
				</div>

				<Button
					variant="outline"
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
				</Button>
			</div>
		{/if}

		{#if filteredAndSortedBeers.length === 0}
			<div class="py-12 text-center">
				<p class="text-muted-foreground">No beers found matching your criteria.</p>
				<Button
					variant="outline"
					class="mt-4"
					onclick={() => {
						searchTerm = '';
						priceRange = [0, 20];
					}}
				>
					Clear Filters
				</Button>
			</div>
		{/if}
	</div>
</div>
