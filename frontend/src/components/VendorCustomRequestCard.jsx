import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Send, Eye, FileText } from "lucide-react";

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
        icon: Send,
        text: "Estimate Sent",
        color: "text-green-600"
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

const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export default function VendorCustomRequestCard({ request, onSubmitEstimate, onViewDetails }) {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  // Determine if estimate can be submitted
  const canSubmitEstimate = ["pending", "under_review"].includes(request.status);

  // Get customer name
  const customerName = request.customer?.firstName && request.customer?.lastName
    ? `${request.customer.firstName} ${request.customer.lastName}`
    : "Unknown Customer";

  // Design image URL
  const designImageUrl = request.designImage 
    ? `http://localhost:5000${request.designImage}`
    : "/placeholder.svg";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate leading-tight">
              {request.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {customerName} @{request.customer?.username || "unknown"}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1 shrink-0 ml-2">
            <StatusIcon className="h-3 w-3" />
            <span className="text-xs">{statusConfig.text}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Design Image */}
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <img 
              src={designImageUrl} 
              alt="Design" 
              className="w-16 h-16 object-cover rounded-lg border"
              onError={(e) => {
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>
          
          {/* Description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncateText(request.description, 120)}
            </p>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          Created: {formatDate(request.createdAt)}
        </div>

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
          
          {/* Submit Estimate - Only for pending/under_review status */}
          {canSubmitEstimate ? (
            <Button 
              onClick={() => onSubmitEstimate?.(request)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Estimate
            </Button>
          ) : (
            <Button 
              disabled
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Estimate Submitted
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
