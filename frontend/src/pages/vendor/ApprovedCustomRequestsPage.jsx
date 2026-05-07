import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, AlertCircle } from "lucide-react";
import ApprovedCustomRequestCard from "@/components/ApprovedCustomRequestCard";
import ConvertToProductModal from "@/components/ConvertToProductModal";
import styles from "./ApprovedCustomRequestsPage.module.css";

export default function ApprovedCustomRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch approved custom requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        "http://localhost:5000/api/custom-requests/vendor?status=approved",
        { withCredentials: true }
      );
      
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching approved requests:", error);
      setError(error.response?.data?.message || "Failed to load approved requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle conversion to product
  const handleConvert = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Handle successful conversion
  const handleConversionSuccess = () => {
    // Refetch requests to update status
    fetchRequests();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading approved requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Requests</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchRequests} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyContainer}>
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Approved Requests</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any approved custom requests ready for conversion.
          </p>
          <p className="text-sm text-muted-foreground">
            Approved requests will appear here when customers accept your estimates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Approved Requests Ready for Conversion</h1>
          <p className={styles.pageSubtitle}>
            {requests.length} {requests.length === 1 ? 'request' : 'requests'} ready to be converted to products
          </p>
        </div>
      </div>

      {/* Requests Grid */}
      <div className={styles.requestsGrid}>
        {requests.map((request) => (
          <ApprovedCustomRequestCard
            key={request._id}
            request={request}
            onConvert={handleConvert}
          />
        ))}
      </div>

      {/* Convert to Product Modal */}
      <ConvertToProductModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
}
