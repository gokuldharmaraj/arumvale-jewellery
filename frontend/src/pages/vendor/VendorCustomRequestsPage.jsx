import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Inbox, AlertCircle } from "lucide-react";
import VendorCustomRequestCard from "@/components/VendorCustomRequestCard";
import ConvertedRequestCard from "@/components/ConvertedRequestCard";
import EstimateSubmissionModal from "@/components/EstimateSubmissionModal";
import ConvertedRequestDetailsModal from "@/components/ConvertedRequestDetailsModal";
import styles from "./VendorCustomRequestsPage.module.css";

export default function VendorCustomRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [convertedRequests, setConvertedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertedLoading, setConvertedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("incoming");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch incoming custom requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        "http://localhost:5000/api/custom-requests/vendor?status=pending,under_review,estimated",
        { withCredentials: true }
      );
      
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching custom requests:", error);
      setError(error.response?.data?.message || "Failed to load custom requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch converted custom requests
  const fetchConvertedRequests = async () => {
    try {
      setConvertedLoading(true);
      setError(null);
      
      const response = await axios.get(
        "http://localhost:5000/api/custom-requests/vendor?status=converted",
        { withCredentials: true }
      );
      
      setConvertedRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching converted requests:", error);
      setError(error.response?.data?.message || "Failed to load converted requests");
    } finally {
      setConvertedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "incoming") {
      fetchRequests();
    } else if (activeTab === "converted") {
      fetchConvertedRequests();
    }
  }, [activeTab]);

  // Handle estimate submission
  const handleSubmitEstimate = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setDetailsRequest(request);
    setIsDetailsModalOpen(true);
  };

  // Handle successful estimate submission
  const handleEstimateSuccess = () => {
    // Refetch requests to update status
    fetchRequests();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setDetailsRequest(null);
  };

  // Loading state
  const currentLoading = activeTab === "incoming" ? loading : convertedLoading;

  if (currentLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="animate-spin" />
          <p>Loading {activeTab === "incoming" ? "incoming" : "converted"} requests...</p>
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
          <button onClick={() => activeTab === "incoming" ? fetchRequests() : fetchConvertedRequests()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentRequests = activeTab === "incoming" ? requests : convertedRequests;
  const currentCount = currentRequests.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Custom Requests</h1>
          <p className={styles.pageSubtitle}>
            {currentCount} {currentCount === 1 ? 'request' : 'requests'} 
            {activeTab === "incoming" ? "need your attention" : "converted"}
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "incoming" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming
          </button>
          <button
            className={`${styles.tab} ${activeTab === "converted" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("converted")}
          >
            Converted
          </button>
        </div>
      </div>

      {/* Requests Grid or Empty State */}
      {currentCount === 0 ? (
        <div className={styles.emptyContainer}>
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No {activeTab === "incoming" ? "Incoming" : "Converted"} Requests
          </h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === "incoming" 
              ? "You don't have any custom requests waiting for your attention."
              : "You haven't converted any custom requests yet."
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {activeTab === "incoming" 
              ? "New custom requests will appear here when customers submit them."
              : "Converted custom requests will appear here after you convert them."
            }
          </p>
        </div>
      ) : (
        <div className={styles.requestsGrid}>
          {activeTab === "incoming" 
            ? requests.map((request) => (
                <VendorCustomRequestCard
                  key={request._id}
                  request={request}
                  onSubmitEstimate={handleSubmitEstimate}
                  onViewDetails={handleViewDetails}
                />
              ))
            : convertedRequests.map((request) => (
                <ConvertedRequestCard
                  key={request._id}
                  request={request}
                  onOpenDetailsModal={setDetailsRequest}
                  setIsDetailsModalOpen={setIsDetailsModalOpen}
                  onViewDetails={handleViewDetails}
                />
              ))
          }
        </div>
      )}

      {/* Estimate Submission Modal */}
      <EstimateSubmissionModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleEstimateSuccess}
      />

      {/* Request Details Modal */}
      <ConvertedRequestDetailsModal
        request={detailsRequest}
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
      />
    </div>
  );
}
