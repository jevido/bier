<script>
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon } from '@lucide/svelte';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />

{@render children()}
