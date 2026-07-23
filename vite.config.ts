import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const zeroProxyPaths = ["/api/zero", "/zero"];

function createZeroProxyConfig(target: string) {
	return {
		target,
		changeOrigin: true,
		ws: true,
		rewrite: (path: string) => {
			for (const prefix of zeroProxyPaths) {
				if (path === prefix || path.startsWith(`${prefix}/`)) {
					const stripped = path.slice(prefix.length);
					return stripped.length > 0 ? stripped : "/";
				}
			}
			return path;
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const zeroUpstream =
		env.ZERO_CACHE_UPSTREAM_URL ??
		env.VITE_ZERO_CACHE_URL ??
		"http://localhost:4848";

	return {
		resolve: { tsconfigPaths: true },
		server: {
			allowedHosts: ["host.docker.internal"],
			proxy: Object.fromEntries(
				zeroProxyPaths.map((path) => [
					path,
					createZeroProxyConfig(zeroUpstream),
				]),
			),
		},
		preview: {
			proxy: Object.fromEntries(
				zeroProxyPaths.map((path) => [
					path,
					createZeroProxyConfig(zeroUpstream),
				]),
			),
		},
		plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
	};
});
