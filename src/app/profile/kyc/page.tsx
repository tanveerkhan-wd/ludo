"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { toast } from "sonner";
import { KYCFormData, kycSchema } from "@/lib/validations/kyc";
import { ZodError } from "zod";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<"PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [formData, setFormData] = useState<KYCFormData>({
    aadhaarFrontUrl: "",
    aadhaarBackUrl: "",
    panUrl: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankHolderName: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const res = await fetch("/api/user/kyc");
      if (res.ok) {
        const data = await res.json();
        if (data.kyc) {
          setStatus(data.kyc.kycStatus);
          setRejectionReason(data.kyc.rejectionReason);
          if (data.kyc.kycStatus === 'REJECTED') {
             // populate existing URLs to help them re-upload if needed
             setFormData({
                aadhaarFrontUrl: data.kyc.aadhaarFrontUrl || "",
                aadhaarBackUrl: data.kyc.aadhaarBackUrl || "",
                panUrl: data.kyc.panUrl || "",
                bankAccountNumber: data.kyc.bankAccountNumber || "",
                bankIfscCode: data.kyc.bankIfscCode || "",
                bankHolderName: data.kyc.bankHolderName || "",
             })
          }
        } else {
          setStatus("PENDING");
        }
      }
    } catch (error) {
      toast.error("Failed to fetch KYC status");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for field
    if (errors[e.target.name as keyof KYCFormData]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      kycSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Partial<Record<keyof KYCFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof KYCFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
        toast.error("Please fill in all required fields correctly.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "KYC Submitted successfully");
        setStatus("SUBMITTED");
      } else {
        toast.error(data.error || "Failed to submit KYC");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex h-[400px] items-center justify-center text-white/50">Loading KYC details...</div>;
  }

  const renderStatus = () => {
    switch (status) {
      case "SUBMITTED":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
            <Clock className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-yellow-500 mb-2">KYC Under Review</h3>
            <p className="text-white/70 text-sm max-w-md">Your KYC documents have been submitted and are currently being reviewed by our team. This usually takes 24-48 hours.</p>
          </div>
        );
      case "VERIFIED":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-500 mb-2">KYC Verified</h3>
            <p className="text-white/70 text-sm max-w-md">Your identity has been successfully verified. You now have full access to all platform features.</p>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-500 mb-2">KYC Rejected</h3>
            <p className="text-white/70 text-sm max-w-md mb-4">Unfortunately, your KYC submission was rejected.</p>
            {rejectionReason && (
              <div className="bg-red-500/20 p-4 rounded-lg text-red-200 text-sm max-w-md w-full text-left border border-red-500/30">
                <strong>Reason:</strong> {rejectionReason}
              </div>
            )}
            <p className="text-white/50 text-xs mt-4">Please submit your details again carefully.</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-white/5 border border-white/10 rounded-xl mb-6">
            <AlertCircle className="w-8 h-8 text-white/50 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">Action Required</h3>
            <p className="text-white/50 text-sm">Please submit your KYC documents to enable withdrawals.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">KYC Verification</h1>
      
      {renderStatus()}

      {(status === "PENDING" || status === "REJECTED" || !status) && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2">Document URLs (Temporary Solution)</h3>
              <p className="text-xs text-white/50">For this version, please provide valid image URLs for your documents.</p>
              
              <div className="space-y-2">
                <label className="text-sm text-white/70">Aadhaar Front URL</label>
                <Input name="aadhaarFrontUrl" value={formData.aadhaarFrontUrl} onChange={handleInputChange} placeholder="https://example.com/aadhaar-front.jpg" />
                {errors.aadhaarFrontUrl && <p className="text-red-500 text-xs">{errors.aadhaarFrontUrl}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Aadhaar Back URL</label>
                <Input name="aadhaarBackUrl" value={formData.aadhaarBackUrl} onChange={handleInputChange} placeholder="https://example.com/aadhaar-back.jpg" />
                {errors.aadhaarBackUrl && <p className="text-red-500 text-xs">{errors.aadhaarBackUrl}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">PAN Card URL</label>
                <Input name="panUrl" value={formData.panUrl} onChange={handleInputChange} placeholder="https://example.com/pan.jpg" />
                {errors.panUrl && <p className="text-red-500 text-xs">{errors.panUrl}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2 mt-6">Bank Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-white/70">Account Holder Name</label>
                <Input name="bankHolderName" value={formData.bankHolderName} onChange={handleInputChange} placeholder="John Doe" />
                {errors.bankHolderName && <p className="text-red-500 text-xs">{errors.bankHolderName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Account Number</label>
                <Input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} placeholder="1234567890" />
                {errors.bankAccountNumber && <p className="text-red-500 text-xs">{errors.bankAccountNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">IFSC Code</label>
                <Input name="bankIfscCode" value={formData.bankIfscCode} onChange={handleInputChange} placeholder="SBIN0001234" />
                {errors.bankIfscCode && <p className="text-red-500 text-xs">{errors.bankIfscCode}</p>}
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : status === "REJECTED" ? "Resubmit KYC" : "Submit KYC"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
