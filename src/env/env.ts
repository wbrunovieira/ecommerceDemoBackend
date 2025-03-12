import { z } from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_URL: z.string().url(),

    JWT_PRIVATE_KEY: z.string(),
    JWT_PUBLIC_KEY: z.string(),
    SENDGRID_API_KEY: z.string(),
    PORT: z.coerce.number().optional().default(3333),

    MELHOR_ENVIO_CLIENTID_TEST: z.coerce.number(),
    MELHOR_ENVIO_SECRET_TEST: z.string(),
    MELHOR_ENVIO_API_URL_TEST: z.string().url(),
    MELHOR_ENVIO_API_URL_CALLBACK_TEST: z.string().url(),
    MELHOR_ENVIO_API_URL_TOKEN_TEST: z.string(),

    MERCADO_PAGO_ACCESS_TOKEN: z.string(),
    MERCADO_PAGO_ASSINATURA_SECRETA_WEBHOOK: z.string(),
});

export type Env = z.infer<typeof envSchema>;
