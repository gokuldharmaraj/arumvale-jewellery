import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle, XCircle, Package, Truck, AlertCircle, FileText } from "lucide-react";

const getStatusConfig = (status) => {
  switch(status) {
    case "pending":
      return {
        variant: "secondary",
        icon: Clock,
        text: "Pending",
        color: "text-gray-600"
      };
    case "under_review":
      return {
        variant: "default",
        icon: Eye,
        text: "Under Review",
        color: "text-blue-600"
      };
    case "estimated":
      return {
        variant: "default",
        icon: AlertCircle,
        text: "Estimate Ready",
        color: "text-green-600"
      };
    case "approved":
      return {
        variant: "default",
        icon: CheckCircle,
        text: "Approved",
        color: "text-green-600"
      };
    case "rejected":
      return {
        variant: "destructive",
        icon: XCircle,
        text: "Rejected",
        color: "text-red-600"
      };
    case "converted":
      return {
        variant: "default",
        icon: Package,
        text: "Converted",
        color: "text-purple-600"
      };
    case "ordered":
      return {
        variant: "default",
        icon: Truck,
        text: "Ordered",
        color: "text-blue-600"
      };
    default:
      return {
        variant: "secondary",
        icon: Clock,
        text: status,
        color: "text-gray-600"
      };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

export default function CustomRequestCard({ request, onViewEstimate, onViewDetails }) {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate leading-tight">
              {request.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vendor: {request.vendor?.shopName || 'Unknown Vendor'}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1 shrink-0 ml-2">
            <StatusIcon className="h-3 w-3" />
            <span className="text-xs">{statusConfig.text}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Created Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          Created: {formatDate(request.createdAt)}
        </div>

        {/* Estimated Price - Only show if status is estimated */}
        {request.status === "estimated" && request.estimate?.price && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Estimated Price:
              </span>
              <span className="text-lg font-bold text-green-600">
                ₹{request.estimate.price.toLocaleString()}
              </span>
            </div>
            {request.estimate.timeline && (
              <p className="text-xs text-green-600 mt-1">
                Timeline: {request.estimate.timeline}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          {/* View Details - Always available */}
          <Button 
            variant="outline"
            onClick={() => onViewDetails?.(request)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {/* View Estimate - Only for estimated status */}
          {request.status === "estimated" && (
            <Button 
              onClick={() => onViewEstimate?.(request)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Estimate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
