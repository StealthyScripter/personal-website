import { defineConfig } from 'vite';

// Used only by the Docker development command; native-host development is unchanged.
export default defineConfig({ server: { watch: { usePolling: true, interval: 1000 } } });
