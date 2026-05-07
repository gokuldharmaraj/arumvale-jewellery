import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Eye, 
  Edit, 
  Package, 
  AlertCircle,
  ExternalLink,
  Image as ImageIcon 
} from "lucide-react";
import styles from "./ConvertedRequestCard.module.css";

export default function ConvertedRequestCard({ request, onOpenDetailsModal, setIsDetailsModalOpen }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Open request details modal (reuse existing modal pattern)
    onOpenDetailsModal(request);
    setIsDetailsModalOpen(true);
  };

  const handleViewProduct = () => {
    if (request.convertedProduct) {
      // Navigate to vendor products listing for safety
      navigate("/vendor/products");
    } else {
      toast({
        title: "Product Not Available",
        description: "The converted product has been removed.",
        variant: "destructive"
      });
    }
  };

  // Get product image (first image or placeholder)
  const productImage = request.convertedProduct?.images?.[0] 
    ? `http://localhost:5000${request.convertedProduct.images[0]}`
    : null;

  // Get design image (original customer reference)
  const designImage = request.designImage 
    ? `http://localhost:5000${request.designImage}`
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.requestInfo}>
          <h3 className={styles.title}>{request.title}</h3>
          <div className={styles.meta}>
            <span className={styles.date}>
              <Calendar className={styles.icon} />
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
            <span className={`${styles.status} ${styles.converted}`}>
              Converted
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.imageSection}>
          {/* Original design image */}
          <div className={styles.imageContainer}>
            {designImage ? (
              <img 
                src={designImage} 
                alt="Original design" 
                className={styles.designImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <ImageIcon className={styles.placeholderIcon} />
              </div>
            )}
            <span className={styles.imageLabel}>Original Design</span>
          </div>

          {/* Converted product image */}
          <div className={styles.imageContainer}>
            {productImage ? (
              <img 
                src={productImage} 
                alt="Converted product" 
                className={styles.productImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Package className={styles.placeholderIcon} />
              </div>
            )}
            <span className={styles.imageLabel}>Product</span>
          </div>
        </div>

        <div className={styles.productInfo}>
          {request.convertedProduct ? (
            <>
              <div className={styles.productName}>
                <Package className={styles.icon} />
                <span>{request.convertedProduct.name}</span>
              </div>
              <div className={styles.productStatus}>
                Status: <span className={
                  request.convertedProduct.status === 'active' 
                    ? styles.activeStatus 
                    : styles.draftStatus
                }>
                  {request.convertedProduct.status}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.productRemoved}>
              <AlertCircle className={styles.icon} />
              <span>Converted Product Removed</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardActions}>
        <button 
          onClick={handleViewDetails}
          className={`${styles.actionButton} ${styles.secondaryButton}`}
        >
          <Eye className={styles.buttonIcon} />
          View Details
        </button>
        
        {request.convertedProduct && (
          <button 
            onClick={handleViewProduct}
            className={`${styles.actionButton} ${styles.primaryButton}`}
          >
            <ExternalLink className={styles.buttonIcon} />
            View Product
          </button>
        )}
      </div>
    </div>
  );
}
