import { z } from 'zod';

export const verifyQrParamSchema = z.object({
  params: z.object({
    qr: z.string({ message: 'QR verification parameter is required' }).min(1),
  }),
});

export const generateQrParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID is required' }),
  }),
});

export type VerifyQrParamInput = z.infer<typeof verifyQrParamSchema>['params'];
export type GenerateQrParamInput = z.infer<typeof generateQrParamSchema>['params'];
