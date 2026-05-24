"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, Button, Input } from "@/components/ui";
import { CheckCircle2, XCircle, Search, Eye, AlertCircle } from "lucide-react";

type KYC = {
  id: string;
  userId: string;
  kycStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  panUrl: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankHolderName: string;
  rejectionReason: string | null;
  submittedAt: string;
  verifiedAt: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  reviewedBy?: {
    name: string;
  };
};

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedKyc, setSelectedKyc] = useState<KYC | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchKycs();
  }, [statusFilter]);

  const fetchKycs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setKycs(data.kycs);
      } else {
        toast.error("Failed to fetch KYC records");
      }
    } catch (error) {
      toast.error("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: action === "REJECT" ? rejectionReason : undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setKycs((prev) => prev.map((k) => (k.id === id ? data.kyc : k)));
        if (selectedKyc?.id === id) setSelectedKyc(null);
        setRejectionReason("");
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Management</h1>
          <p className="text-white/60 text-sm">Review and manage user KYC applications.</p>
        </div>

        <div className="flex gap-2">
          {["ALL", "PENDING", "SUBMITTED", "VERIFIED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden bg-black/20 border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                      Loading...
                    </td>
                  </tr>
                ) : kycs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                      No records found
                    </td>
                  </tr>
                ) : (
                  kycs.map((kyc) => (
                    <tr key={kyc.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedKyc(kyc)}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{kyc.user.name}</div>
                        <div className="text-white/50 text-xs">{kyc.user.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            kyc.kycStatus === "VERIFIED"
                              ? "bg-green-500/20 text-green-400"
                              : kyc.kycStatus === "REJECTED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {kyc.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {kyc.submittedAt ? format(new Date(kyc.submittedAt), "dd MMM yyyy, HH:mm") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedKyc(kyc); }}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          {selectedKyc ? (
            <Card className="p-6 sticky top-6 bg-black/40 border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">KYC Details</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase text-white/50 mb-2 font-semibold">User Info</h4>
                  <p className="text-white text-sm font-medium">{selectedKyc.user.name}</p>
                  <p className="text-white/70 text-sm">{selectedKyc.user.phone}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase text-white/50 mb-2 font-semibold">Bank Details</h4>
                  <div className="space-y-1">
                    <p className="text-white/70 text-sm"><span className="text-white/50">A/C Name:</span> {selectedKyc.bankHolderName}</p>
                    <p className="text-white/70 text-sm"><span className="text-white/50">A/C No:</span> {selectedKyc.bankAccountNumber}</p>
                    <p className="text-white/70 text-sm"><span className="text-white/50">IFSC:</span> {selectedKyc.bankIfscCode}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase text-white/50 mb-2 font-semibold">Documents</h4>
                  <div className="space-y-3">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <p className="text-xs text-white/50 mb-1">Aadhaar Front</p>
                      <a href={selectedKyc.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                        {selectedKyc.aadhaarFrontUrl}
                      </a>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <p className="text-xs text-white/50 mb-1">Aadhaar Back</p>
                      <a href={selectedKyc.aadhaarBackUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                        {selectedKyc.aadhaarBackUrl}
                      </a>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <p className="text-xs text-white/50 mb-1">PAN Card</p>
                      <a href={selectedKyc.panUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all">
                        {selectedKyc.panUrl}
                      </a>
                    </div>
                  </div>
                </div>

                {selectedKyc.kycStatus === "SUBMITTED" && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="mb-4">
                      <label className="text-xs text-white/70 mb-1 block">Rejection Reason (if rejecting)</label>
                      <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Blur image, unmatched name..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={processing}
                        onClick={() => handleAction(selectedKyc.id, "APPROVE")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        disabled={processing}
                        onClick={() => handleAction(selectedKyc.id, "REJECT")}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedKyc.kycStatus !== "SUBMITTED" && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/70">
                      Status: <strong className="text-white">{selectedKyc.kycStatus}</strong>
                    </p>
                    {selectedKyc.kycStatus === "REJECTED" && (
                      <p className="text-sm text-red-400 mt-1">Reason: {selectedKyc.rejectionReason}</p>
                    )}
                    {selectedKyc.reviewedBy && (
                      <p className="text-xs text-white/50 mt-2">Reviewed by {selectedKyc.reviewedBy.name}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-white/50 bg-black/20 border-white/5 flex flex-col items-center justify-center h-full min-h-[300px]">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a record to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
