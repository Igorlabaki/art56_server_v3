import { z } from "zod";

export const getByIdUserPermissionSchema = z.object({
    userPermissionId: z.string(),
});

export type GetByIdUserPermissionSchema = z.infer<typeof getByIdUserPermissionSchema>;