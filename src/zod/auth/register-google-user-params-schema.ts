import { z } from "zod";

export const registerGoogleUserSchema = z.object({
    googleToken: z.string(),
    userData: z.object({
        email: z.string().email(),
        name: z.string(),
        googleId: z.string(),
        picture: z.string(),
        password: z.string(),
    })
});

export type RegisterGoogleUserRequestParams = z.infer<typeof registerGoogleUserSchema>;
