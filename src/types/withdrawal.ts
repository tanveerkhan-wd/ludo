import { z } from 'zod';

export const UpdatePaymentMethodSchema = z.object({
  preferredWithdrawalMethod: z.enum(['UPI', 'BANK']),
  upiId: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
  bankAccountHolderName: z.string().optional(),
}).refine(data => {
  if (data.preferredWithdrawalMethod === 'UPI') {
    return !!data.upiId && data.upiId.length > 0;
  }
  if (data.preferredWithdrawalMethod === 'BANK') {
    return !!data.bankAccountNumber && !!data.bankIfscCode && !!data.bankAccountHolderName;
  }
  return true;
}, {
  message: "Please provide complete details for your preferred withdrawal method.",
  path: ["preferredWithdrawalMethod"]
});

export const WithdrawalRequestSchema = z.object({
  amount: z.number().min(100, "Minimum withdrawal amount is ₹100"),
});

export const AdminWithdrawalActionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PROCESSED']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional()
});
