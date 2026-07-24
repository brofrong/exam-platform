import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";

/**
 * Domain mutators — stub keeps the registry non-empty for TypeScript until LMS
 * mutators land. Always rejects; remove when real mutators exist.
 */
export const mutators = defineMutators({
	_unavailable: defineMutator(z.object({}), async ({ ctx }) => {
		if (!ctx?.id) {
			throw new Error("Unauthorized");
		}
		throw new Error("No domain mutators registered yet");
	}),
});
