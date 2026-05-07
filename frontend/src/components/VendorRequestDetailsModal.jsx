import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Store, FileText, AlertCircle, CheckCircle, XCircle, Package, Truck, Eye, User, Send } from "lucide-react";

const getStatusConfig = (status) => {
  switch(status) {
    case "pending":
      return {
        variant: "secondary",
        icon: Clock,
        text: "Pending",
        color: "text-gray-600",
        nextSteps: "Review the customer's request and provide an accurate estimate for the custom jewellery."
      };
    case "under_review":
      return {
        variant: "default",
        icon: Eye,
        text: "Under Review",
        color: "text-blue-600",
        nextSteps: "You're actively reviewing this request. Submit your estimate when ready."
      };
    case "estimated":
      return {
        variant: "default",
        icon: Send,
        text: "Estimate Sent",
        color: "text-green-600",
        nextSteps: "Your estimate has been sent to the customer. Wait for their response."
      };
    case "approved":
      return {
        variant: "default",
        icon: CheckCircle,
        text: "Approved",
        color: "text-green-600",
        nextSteps: "Customer approved your estimate. Begin creating the custom jewellery."
      };
    case "rejected":
      return {
        variant: "destructive",
        icon: XCircle,
        text: "Rejected",
        color: "text-red-600",
        nextSteps: "Customer rejected the estimate. You may submit a revised estimate if needed."
      };
    case "converted":
      return {
        variant: "default",
        icon: Package,
        text: "Converted",
        color: "text-purple-600",
        nextSteps: "Request has been converted to a product and is available for ordering."
      };
    case "ordered":
      return {
        variant: "default",
        icon: Truck,
        text: "Ordered",
        color: "text-blue-600",
        nextSteps: "Customer has ordered the custom jewellery. Fulfill the order."
      };
    default:
      return {
        variant: "secondary",
        icon: Clock,
        text: status,
        color: "text-gray-600",
        nextSteps: "Contact support for more information about this request."
      };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function VendorRequestDetailsModal({ 
  request, 
  isOpen, 
  onClose, 
  onSubmitEstimate 
}) {
  if (!request) return null;

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  // Determine if estimate can be submitted
  const canSubmitEstimate = ["pending", "under_review"].includes(request.status);

  // Get customer name
  const customerName = request.customer?.firstName && request.customer?.lastName
    ? `${request.customer.firstName} ${request.customer.lastName}`
    : "Unknown Customer";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-tight">
                  {request.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Request ID: {request._id}
                </p>
              </div>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1 shrink-0 ml-2">
                <StatusIcon className="h-3 w-3" />
                <span className="text-xs">{statusConfig.text}</span>
              </Badge>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">{customerName}</p>
                  <p className="text-sm text-blue-600">@{request.customer?.username || "unknown"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Created: {formatDate(request.createdAt)}
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Customer Description
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground bg-muted/50 rounded-lg p-4">
              {request.description}
            </p>
          </div>

          {/* Design Image Section */}
          {request.designImage && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Design Reference
                </h4>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={`http://localhost:5000${request.designImage}`}
                    alt="Design Reference"
                    className="w-full h-auto max-h-96 object-contain bg-muted/20"
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Next Steps Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Next Steps</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  {statusConfig.nextSteps}
                </p>
              </div>
            </div>
          </div>

          {/* Existing Estimate Info (if any) */}
          {request.status === "estimated" && request.estimate?.price && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Your Estimate</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Your Price:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{request.estimate.price.toLocaleString()}
                    </span>
                  </div>
                  {request.estimate.timeline && (
                    <p className="text-sm text-green-700">
                      Timeline: {request.estimate.timeline}
                    </p>
                  )}
                  {request.estimate.notes && (
                    <p className="text-sm text-green-700 mt-2">
                      Notes: {request.estimate.notes}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {canSubmitEstimate && (
              <Button 
                onClick={() => {
                  onSubmitEstimate?.(request);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Estimate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
