import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign, Clock, FileText, User } from "lucide-react";

export default function EstimateSubmissionModal({ 
  request, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
    timeline: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  const resetForm = () => {
    setFormData({ price: "", timeline: "", notes: "" });
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    
    if (!formData.timeline.trim()) {
      newErrors.timeline = "Timeline is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/custom-requests/${request._id}/estimate`,
        {
          price: parseFloat(formData.price),
          timeline: formData.timeline.trim(),
          notes: formData.notes.trim() || undefined
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: "Estimate submitted successfully!",
      });

      // Call onSuccess to trigger parent refetch
      onSuccess?.();
      
      // Close modal and reset form
      handleClose();

    } catch (error) {
      console.error("Submit estimate error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to submit estimate";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;
  
  // Ensure customer data exists before rendering
  if (!request.customer) {
    console.warn("Request customer data is missing:", request);
    return null;
  }

  // Get customer name
  const customerName = request.customer?.firstName && request.customer?.lastName
    ? `${request.customer.firstName} ${request.customer.lastName}`
    : request.customer?.username || "Unknown Customer";

  // Design image URL
  const designImageUrl = request.designImage 
    ? `http://localhost:5000${request.designImage}`
    : "/placeholder.svg";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Submit Estimate
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Request Context */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Request Details</h3>
            
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="shrink-0">
                <img 
                  src={designImageUrl} 
                  alt="Design" 
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{request.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {customerName}
                </p>
              </div>
            </div>
          </div>

          {/* Estimate Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">
                Timeline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="timeline"
                name="timeline"
                placeholder="e.g. 2-3 weeks, 15 days"
                value={formData.timeline}
                onChange={handleChange}
                className={errors.timeline ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.timeline && (
                <p className="text-sm text-destructive">{errors.timeline}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional details about the estimate, materials, process..."
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Estimate"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
