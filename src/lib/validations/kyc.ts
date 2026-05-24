import { z } from 'zod';

export const kycSchema = z.object({
  aadhaarFrontUrl: z.string().url("Valid URL is required for Aadhaar Front").min(1, "Aadhaar Front is required"),
  aadhaarBackUrl: z.string().url("Valid URL is required for Aadhaar Back").min(1, "Aadhaar Back is required"),
  panUrl: z.string().url("Valid URL is required for PAN Card").min(1, "PAN Card is required"),
  bankAccountNumber: z.string().min(5, "Bank Account Number is required"),
  bankIfscCode: z.string().min(4, "Bank IFSC Code is required").regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code format"),
  bankHolderName: z.string().min(2, "Bank Holder Name is required"),
});

export type KYCFormData = z.infer<typeof kycSchema>;
