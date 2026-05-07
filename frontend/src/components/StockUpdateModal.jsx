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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Package } from "lucide-react";

export default function StockUpdateModal({ 
  productId, 
  productName, 
  currentStock, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newStock, setNewStock] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  const resetForm = () => {
    setNewStock("");
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Handle stock input change
  const handleStockChange = (e) => {
    const value = e.target.value;
    setNewStock(value);
    
    // Clear error for this field
    if (errors.newStock) {
      setErrors(prev => ({
        ...prev,
        newStock: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newStock.trim()) {
      newErrors.newStock = "Stock quantity is required";
    } else if (isNaN(newStock)) {
      newErrors.newStock = "Stock must be a number";
    } else if (parseInt(newStock) < 0) {
      newErrors.newStock = "Stock cannot be negative";
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
        description: "Please enter a valid stock quantity",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Update product stock using dedicated stock endpoint
      const response = await axios.patch(
        `http://localhost:5000/api/products/${productId}/stock`,
        { stock: parseInt(newStock) },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: `Stock updated for ${productName}`,
      });

      // Call onSuccess to trigger parent refetch
      onSuccess?.();
      
      // Close modal and reset form
      handleClose();

    } catch (error) {
      console.error("Stock update error:", error);
      
      let errorMessage = "Failed to update stock";
      
      if (error.response?.status === 403) {
        errorMessage = "Not authorized to update this product";
      } else if (error.response?.status === 404) {
        errorMessage = "Product not found";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-sm">{productName}</p>
              <p className="text-xs text-muted-foreground">Product ID: {productId}</p>
            </div>
          </div>

          {/* Stock Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Stock</Label>
              <div className="p-2 bg-gray-50 border rounded text-sm">
                {currentStock} units
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStock">
                New Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newStock"
                type="number"
                placeholder="Enter new stock quantity"
                value={newStock}
                onChange={handleStockChange}
                className={errors.newStock ? "border-destructive" : ""}
                disabled={loading}
                min="0"
              />
              {errors.newStock && (
                <p className="text-sm text-destructive">{errors.newStock}</p>
              )}
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
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
