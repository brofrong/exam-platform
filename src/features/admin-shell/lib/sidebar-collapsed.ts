export const ADMIN_SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

export function readSidebarCollapsed(): boolean {
	if (typeof localStorage === "undefined") return false;
	try {
		return localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function writeSidebarCollapsed(collapsed: boolean): void {
	if (typeof localStorage === "undefined") return;
	try {
		if (collapsed) {
			localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, "1");
		} else {
			localStorage.removeItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
		}
	} catch {
		// ignore quota / private mode
	}
}
