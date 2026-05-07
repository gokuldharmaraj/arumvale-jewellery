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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package, DollarSign, User, CheckCircle } from "lucide-react";

export default function ConvertToProductModal({ 
  request, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: request?.title || "",
    productDescription: request?.description || "",
    category: "",
    purity: "",
    weight: "",
    stock: "1",
    price: request?.estimate?.price?.toString() || ""
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  const resetForm = () => {
    setFormData({
      productName: request?.title || "",
      productDescription: request?.description || "",
      category: "",
      purity: "",
      weight: "",
      stock: "1",
      price: request?.estimate?.price?.toString() || ""
    });
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

  // Handle select changes
  const handleSelectChange = (name, value) => {
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
    
    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    
    if (!formData.productDescription.trim()) {
      newErrors.productDescription = "Product description is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.purity) {
      newErrors.purity = "Purity is required";
    }
    
    if (!formData.weight || isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
      newErrors.weight = "Weight must be a positive number";
    }
    
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 1) {
      newErrors.stock = "Stock must be at least 1";
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
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
      // Send form data to backend
      const response = await axios.post(
        `http://localhost:5000/api/custom-requests/${request._id}/convert`,
        {
          productName: formData.productName,
          productDescription: formData.productDescription,
          category: formData.category,
          purity: formData.purity,
          weight: formData.weight,
          stock: formData.stock,
          price: formData.price
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: "Request converted to product successfully!",
      });

      // Call onSuccess to trigger parent refetch
      onSuccess?.();
      
      // Close modal and reset form
      handleClose();

    } catch (error) {
      console.error("Convert to product error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to convert request to product";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get customer name
  const customerName = request?.customer?.firstName && request?.customer?.lastName
    ? `${request.customer.firstName} ${request.customer.lastName}`
    : "Unknown Customer";

  // Design image URL
  const designImageUrl = request?.designImage 
    ? `http://localhost:5000${request.designImage}`
    : "/placeholder.svg";

  // Estimate price
  const estimatePrice = request?.estimate?.price;

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Convert to Product
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
                  className="w-16 h-16 object-cover rounded border"
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
                {estimatePrice && (
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    Approved: ₹{estimatePrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Product Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  disabled={loading}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Necklace">Necklace</SelectItem>
                    <SelectItem value="Ring">Ring</SelectItem>
                    <SelectItem value="Bangle">Bangle</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Pendant">Pendant</SelectItem>
                    <SelectItem value="Anklet">Anklet</SelectItem>
                    <SelectItem value="Chain">Chain</SelectItem>
                    <SelectItem value="Bracelet">Bracelet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purity">
                  Purity <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.purity}
                  onValueChange={(value) => handleSelectChange("purity", value)}
                  disabled={loading}
                >
                  <SelectTrigger className={errors.purity ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24K">24K</SelectItem>
                    <SelectItem value="22K">22K</SelectItem>
                    <SelectItem value="18K">18K</SelectItem>
                    <SelectItem value="14K">14K</SelectItem>
                    <SelectItem value="925 Silver">925 Silver</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purity && (
                  <p className="text-sm text-destructive">{errors.purity}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight (g) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Enter weight in grams"
                  value={formData.weight}
                  onChange={handleChange}
                  className={errors.weight ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="1"
                  placeholder="Enter stock quantity"
                  value={formData.stock}
                  onChange={handleChange}
                  className={errors.stock ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">{errors.stock}</p>
                )}
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="price">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable Product Details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
                className={errors.productName ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.productName && (
                <p className="text-sm text-destructive">{errors.productName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">
                Product Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="productDescription"
                name="productDescription"
                placeholder="Enter product description"
                rows={3}
                value={formData.productDescription}
                onChange={handleChange}
                className={errors.productDescription ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.productDescription && (
                <p className="text-sm text-destructive">{errors.productDescription}</p>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Conversion Details:</p>
                  <ul className="text-xs space-y-1">
                    <li>• This product will be created as Draft and can be edited before publishing</li>
                    <li>• Design image will be used as product image</li>
                    <li>• Product will be linked to this custom request</li>
                  </ul>
                </div>
              </div>
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
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Product"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
