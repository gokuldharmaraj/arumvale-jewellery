import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomRequestPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    vendor: "",
    title: "",
    description: ""
  });
  
  const [vendors, setVendors] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch approved vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/vendors/approved",
          { withCredentials: true }
        );
        
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast({
          title: "Error",
          description: "Failed to load vendors",
          variant: "destructive"
        });
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, [toast]);

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

  const handleVendorChange = (value) => {
    setFormData(prev => ({
      ...prev,
      vendor: value
    }));
    
    if (errors.vendor) {
      setErrors(prev => ({
        ...prev,
        vendor: ""
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        
        if (!isValidType) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image`,
            variant: "destructive"
          });
          return false;
        }
        
        if (!isValidSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive"
          });
          return false;
        }
        
        return true;
      });

      setImageFiles(prev => [...prev, ...validFiles]);
      
      // Create image previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vendor) newErrors.vendor = "Please select a vendor";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (imageFiles.length === 0) newErrors.images = "At least one design image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('vendor', formData.vendor);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('user', user._id);

      // Add images
      imageFiles.forEach(file => {
        formDataToSend.append('designImage', file);
      });

      const response = await axios.post(
        "http://localhost:5000/api/custom-requests",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast({
        title: "Success",
        description: "Custom request submitted successfully!",
      });

      // Redirect to custom requests list
      navigate("/custom-requests");

    } catch (error) {
      console.error("Submit custom request error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to submit custom request";
      
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/custom-requests")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Requests
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Submit Custom Jewellery Request
        </h1>
        <p className="text-muted-foreground">
          Describe your custom jewellery design and our approved vendors will provide estimates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">
                Select Vendor <span className="text-destructive">*</span>
              </Label>
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading vendors...</span>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved vendors available at the moment
                </div>
              ) : (
                <Select
                  value={formData.vendor}
                  onValueChange={handleVendorChange}
                >
                  <SelectTrigger className={errors.vendor ? "border-destructive" : ""}>
                    <SelectValue placeholder="Choose a vendor for your custom request" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor._id} value={vendor.user._id}>
                        <div>
                          <div className="font-medium">{vendor.shopName}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.shopType} • {vendor.yearsInBusiness} years in business
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.vendor && (
                <p className="text-sm text-destructive">{errors.vendor}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Request Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Custom Diamond Engagement Ring"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your custom jewellery design in detail. Include specifications like metal type, gemstones, size, design preferences, budget range, and any other important details..."
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Design Images */}
        <Card>
          <CardHeader>
            <CardTitle>Design Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">
                Upload Design References <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Upload reference images, sketches, or inspiration photos (Max 5MB per image)
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center cursor-pointer hover:text-primary transition-colors"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">
                    Click to upload images
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB each
                  </span>
                </label>
              </div>
              
              {errors.images && (
                <p className="text-sm text-destructive">{errors.images}</p>
              )}
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Remove image</span>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/custom-requests")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || vendorsLoading || vendors.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
