import { z } from 'zod';

const envSchema = z.object({
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
    EXPO_PUBLIC_APP_NAME: z.string().min(1),
    EXPO_PUBLIC_VERSION: z.string().min(1),
    EXPO_PUBLIC_APP_KEY: z.string().min(1),
});

const rawEnv = {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
    EXPO_PUBLIC_VERSION: process.env.EXPO_PUBLIC_VERSION,
    EXPO_PUBLIC_APP_KEY: process.env.EXPO_PUBLIC_APP_KEY,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
    console.error('❌ Invalid environment variables');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}

export const Env = parsed.data;