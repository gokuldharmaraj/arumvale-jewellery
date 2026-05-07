import { Upload, Info, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import styles from "./AddProductPage.module.css";

// API base URL - following existing project pattern
const API_BASE_URL = "http://localhost:5000/api";

const categories = ["Necklace", "Ring", "Bangle", "Earrings", "Pendant", "Anklet", "Chain", "Bracelet"];
const purities = ["24K", "22K", "18K", "14K", "925 Silver", "Platinum"];

export default function AddProductPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    price: "",
    comparePrice: "",
    weight: "",
    purity: "",
    stock: "",
    hallmark: "",
    tags: "",
    status: "draft"
  });

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch product data for edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id, isEditMode]);

  const fetchProductData = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/products/${id}`,
        { withCredentials: true }
      );
      
      const product = response.data;
      
      // Store product data for publish guard
      setCurrentProduct(product);
      
      // Pre-fill form data
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        sku: product.sku || "",
        price: product.price?.toString() || "",
        comparePrice: product.comparePrice?.toString() || "",
        weight: product.weight?.toString() || "",
        purity: product.purity || "",
        stock: product.stock?.toString() || "",
        hallmark: product.hallmark || "",
        tags: product.tags?.join(', ') || "",
        status: product.status || "draft"
      });
      
      // Set existing images
      setExistingImages(product.images || []);
      
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive"
      });
      navigate("/vendor/products");
    } finally {
      setFetchLoading(false);
    }
  };

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
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
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.weight || formData.weight <= 0) newErrors.weight = "Valid weight is required";
    if (!formData.purity) newErrors.purity = "Purity is required";
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Valid stock quantity is required";
    // Only require new images in create mode, or if no existing images in edit mode
    if (!isEditMode && imageFiles.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, overrideStatus = null) => {
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
      console.log("=== DEBUG INFO ===");
      console.log("overrideStatus:", overrideStatus);
      console.log("formData.status:", formData.status);
      console.log("==================");
      
      Object.keys(formData).forEach(key => {
        // Always include status field, even if empty (defaults to draft)
        if (formData[key] !== "" || key === 'status') {
          const value = key === 'status' && overrideStatus ? overrideStatus : formData[key];
          if (key === 'status') {
            console.log(`STATUS LOGIC: key=${key}, overrideStatus=${overrideStatus}, formData.status=${formData.status}, finalValue=${value}`);
          }
          formDataToSend.append(key, value);
        }
      });

      // Add images
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // LOG FORM DATA BEFORE SENDING
      console.log("=== FORM DATA PAYLOAD ===");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("========================");

      const response = await axios[isEditMode ? 'put' : 'post'](
        isEditMode ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`,
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
        description: isEditMode ? "Product updated successfully!" : "Product created successfully!",
      });

      // Redirect to manage products page
      navigate("/vendor/products");

    } catch (error) {
      console.error(isEditMode ? "Update product error:" : "Create product error:", error);
      
      const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (e) => {
    e?.preventDefault();
    setFormData(prev => ({ ...prev, status: "draft" }));
    await handleSubmit(e, "draft");
  };

  const handlePublish = async (e) => {
    e?.preventDefault();
    
    // Calculate total images (existing + newly uploaded)
    const totalImageCount = existingImages.length + imageFiles.length;
    
    // Publish guard for converted custom products
    // Backend will handle cleanup and validation, but we provide early feedback
    if (isEditMode && currentProduct?.isCustom && currentProduct?.customRequestId) {
      if (totalImageCount === 1) {
        toast({
          title: "Cannot Publish",
          description: "Upload actual product photos before publishing this converted product.",
          variant: "destructive"
        });
        return;
      }
      
      // Inform user that reference image will be removed
      if (totalImageCount > 1) {
        toast({
          title: "Publishing Custom Product",
          description: "Original customer reference image will be removed. Only vendor photos will be shown.",
          variant: "default"
        });
      }
    }
    
    setFormData(prev => ({ ...prev, status: "active" }));
    await handleSubmit(e, "active");
  };

  // Show loading state when fetching product data in edit mode
  if (fetchLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        <p className={styles.pageSubtitle}>
          {isEditMode ? "Update your product details below." : "Fill in the details to list a new product on your store."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.threeColumnGrid}>
        {/* Column 1: Basic Information */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Basic Information</h2>
          <div className={styles.formSpace}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Product Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Royal Diamond Necklace"
                className={`${styles.formInput} ${errors.name ? styles.error : ""}`}
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description of your product..."
                className={`${styles.formTextarea} ${errors.description ? styles.error : ""}`}
              />
              {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Category <span className={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles.formSelect} ${errors.category ? styles.error : ""}`}
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className={styles.errorMessage}>{errors.category}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. GV-NK-001"
                className={styles.formInput}
              />
            </div>
          </div>
        </div>

        {/* Column 2: Pricing & Specifications */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pricing & Specifications</h2>
          <div className={styles.formSpace}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Price (Rs) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`${styles.formInput} ${errors.price ? styles.error : ""}`}
              />
              {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Compare Price (Rs)</label>
              <input
                type="number"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Weight (g) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`${styles.formInput} ${errors.weight ? styles.error : ""}`}
              />
              {errors.weight && <span className={styles.errorMessage}>{errors.weight}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Purity <span className={styles.required}>*</span>
              </label>
              <select
                name="purity"
                value={formData.purity}
                onChange={handleChange}
                className={`${styles.formSelect} ${errors.purity ? styles.error : ""}`}
              >
                <option value="">Select purity</option>
                {purities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.purity && <span className={styles.errorMessage}>{errors.purity}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Stock <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`${styles.formInput} ${errors.stock ? styles.error : ""}`}
              />
              {errors.stock && <span className={styles.errorMessage}>{errors.stock}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Hallmark</label>
              <input
                type="text"
                name="hallmark"
                value={formData.hallmark}
                onChange={handleChange}
                placeholder="e.g. BIS 916"
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="gold, necklace, wedding"
                className={styles.formInput}
              />
            </div>
          </div>
        </div>

        {/* Column 3: Product Images */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Product Images</h2>
          <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
            <div className={styles.uploadIcon}>
              <Upload className="h-4 w-4" />
            </div>
            <p className={styles.uploadText}>Click to upload images</p>
            <p className={styles.uploadHint}>PNG, JPG up to 5MB each</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          
          {images.length > 0 && (
            <div className={styles.imagePreviewGrid}>
              {images.map((img, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={img} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className={styles.imageInfo}>
            <Info className="h-3 w-3" />
            <span>Add at least one image. First image will be the cover.</span>
          </div>
          
          {/* Publish buttons */}
          <div className={styles.publishForm}>
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className={styles.publishButton}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Product"
              )}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className={styles.draftButton}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
