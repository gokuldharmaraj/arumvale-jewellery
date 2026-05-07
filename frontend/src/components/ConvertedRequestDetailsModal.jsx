import { useState } from "react";
import { Calendar, Package, User, Image as ImageIcon } from "lucide-react";
import styles from "./ConvertedRequestDetailsModal.module.css";

export default function ConvertedRequestDetailsModal({ request, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !request) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Conversion Summary</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Request Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Request Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Title:</span>
                <span className={styles.value}>{request.title}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Created:</span>
                <span className={styles.value}>
                  <Calendar className={styles.icon} />
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Customer:</span>
                <span className={styles.value}>
                  <User className={styles.icon} />
                  {request.customer?.username || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Original Design */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Original Design Reference</h3>
            <div className={styles.designImageContainer}>
              {request.designImage ? (
                <img 
                  src={`http://localhost:5000${request.designImage}`} 
                  alt="Original customer design" 
                  className={styles.designImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <ImageIcon className={styles.placeholderIcon} />
                  <span>No design image</span>
                </div>
              )}
            </div>
          </div>

          {/* Conversion Summary */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Conversion Summary</h3>
            <div className={styles.summaryContent}>
              <p className={styles.summaryText}>
                This custom request has been converted into a vendor product.
                The original customer reference is preserved for historical purposes.
              </p>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Converted Product:</span>
                  <span className={styles.value}>
                    {request.convertedProduct ? (
                      <>
                        <Package className={styles.icon} />
                        {request.convertedProduct.name}
                      </>
                    ) : (
                      <span className={styles.removedText}>Product Removed</span>
                    )}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Product Status:</span>
                  <span className={styles.value}>
                    {request.convertedProduct?.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Instructions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Next Steps</h3>
            <div className={styles.instructions}>
              <p className={styles.instructionText}>
                <strong>Use Edit Product</strong> to refine pricing, inventory, and final product images.
              </p>
              <p className={styles.instructionText}>
                <strong>Use View Product</strong> to review the converted catalog listing.
              </p>
              <p className={styles.instructionText}>
                The original customer reference image is automatically removed during publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
