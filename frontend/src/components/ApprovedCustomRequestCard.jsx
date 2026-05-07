import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Package, DollarSign, Calendar } from "lucide-react";

const getStatusConfig = (status) => {
  switch(status) {
    case "approved":
      return {
        variant: "default",
        icon: CheckCircle,
        text: "Approved",
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

const formatPrice = (price) => {
  if (!price) return "₹0";
  return `₹${price.toLocaleString()}`;
};

export default function ApprovedCustomRequestCard({ request, onConvert }) {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  // Get customer name
  const customerName = request.customer?.firstName && request.customer?.lastName
    ? `${request.customer.firstName} ${request.customer.lastName}`
    : "Unknown Customer";

  // Design image URL
  const designImageUrl = request.designImage 
    ? `http://localhost:5000${request.designImage}`
    : "/placeholder.svg";

  // Estimate details
  const estimatePrice = request.estimate?.price;
  const estimateTimeline = request.estimate?.timeline;

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
          
          {/* Request Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.description?.substring(0, 80)}{request.description?.length > 80 ? "..." : ""}
            </p>
          </div>
        </div>

        {/* Estimate Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Approved Price:
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(estimatePrice)}
            </span>
          </div>
          
          {estimateTimeline && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline:
              </span>
              <span className="text-sm font-medium text-green-600">
                {estimateTimeline}
              </span>
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          Created: {formatDate(request.createdAt)}
        </div>

        {/* Convert Button */}
        <div className="flex justify-end pt-2">
          <Button 
            onClick={() => onConvert?.(request)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Convert to Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
