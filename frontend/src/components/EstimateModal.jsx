import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, DollarSign, FileText, Store, Clock } from "lucide-react";

export default function EstimateModal({ request, isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    setPendingDecision("approved");
    setShowConfirmDialog(true);
  };

  const handleReject = () => {
    setPendingDecision("rejected");
    setShowConfirmDialog(true);
  };

  const handleConfirmDecision = async () => {
    if (!pendingDecision) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/custom-requests/${request._id}/respond`,
        {
          decision: pendingDecision,
          notes: notes.trim() || undefined,
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: `Estimate ${pendingDecision} successfully`,
      });

      // Call onSuccess to trigger parent refetch
      onSuccess?.();
      
      // Close modal
      onClose();
      
      // Reset state
      setNotes("");
      setPendingDecision(null);
      setShowConfirmDialog(false);

    } catch (error) {
      console.error("Respond to estimate error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to respond to estimate";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingDecision(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!request) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estimate Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Request Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Request Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Title:</span>
                  <span className="text-sm font-medium">{request.title}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Vendor:</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {request.vendor?.shopName || request.vendor?.username || 'Unknown Vendor'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Estimate Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Estimate Details</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Estimated Price:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{request.estimate?.price?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                
                {request.estimate?.timeline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline:
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {request.estimate.timeline}
                    </span>
                  </div>
                )}
                
                {request.estimate?.notes && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes:
                    </span>
                    <p className="text-sm text-green-700 bg-green-100 rounded p-2">
                      {request.estimate.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Response Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the vendor..."
                className="w-full p-3 border rounded-lg resize-none h-20 text-sm"
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Approve Estimate"
                )}
              </Button>
              
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Reject Estimate"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDecision === "approved" ? "Approve Estimate?" : "Reject Estimate?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDecision === "approved" 
                ? "Are you sure you want to approve this estimate? The vendor will be notified and may begin work on your custom jewellery."
                : "Are you sure you want to reject this estimate? You may need to submit a new request if you change your mind."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} onClick={handleCancelConfirm}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleConfirmDecision}
              className={pendingDecision === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                pendingDecision === "approved" ? "Approve" : "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
