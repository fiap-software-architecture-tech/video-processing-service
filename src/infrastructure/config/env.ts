import z from 'zod';

const envSchema = z.object({
    // Environment
    NODE_ENV: z.enum(['dev', 'hml', 'prd']).default('dev'),

    AWS_REGION: z.string(),
    AWS_ENDPOINT: z.string(),
    AWS_BUCKET_NAME: z.string(),
    AWS_SQS_URL: z.string(),
});

export const env = envSchema.parse(process.env);
