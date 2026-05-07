import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Plus, Loader2, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomRequestCard from "@/components/CustomRequestCard";
import EstimateModal from "@/components/EstimateModal";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import LoginPrompt from "@/components/LoginPrompt";

export default function CustomRequestsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch user's custom requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        "http://localhost:5000/api/custom-requests/my",
        { withCredentials: true }
      );
      
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching custom requests:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to load your custom requests";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle view estimate
  const handleViewEstimate = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setDetailsRequest(request);
    setIsDetailsModalOpen(true);
  };

  // Handle modal success (after approve/reject)
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    fetchRequests(); // Refetch the list
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setDetailsRequest(null);
  };

  // Initial fetch - only when authenticated
  useEffect(() => {
    if (isLoggedIn) {
      fetchRequests();
    }
  }, [isLoggedIn]);

  // Show login prompt for unauthenticated users
  if (!isLoggedIn) {
    return (
      <LoginPrompt 
        title="Sign In to View Custom Requests"
        description="Log in to track your custom jewellery requests and review vendor estimates. Keep track of your personalized designs and communicate with approved vendors."
        icon={<FileText className="h-10 w-10 text-primary" />}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <Button
            onClick={() => navigate("/custom-request")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Custom Requests
        </h1>
        <p className="text-muted-foreground">
          Track the status of your custom jewellery requests and review vendor estimates
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your custom requests...</p>
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="text-destructive text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Unable to Load Requests
              </h2>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={fetchRequests} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : requests.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="text-muted-foreground text-6xl mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Custom Requests Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any custom jewellery requests yet. Start by creating your first custom request to get personalized estimates from our approved vendors.
              </p>
              <Button onClick={() => navigate("/custom-request")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Request
              </Button>
            </div>
          </div>
        ) : (
          // Requests list
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <CustomRequestCard
                key={request._id}
                request={request}
                onViewEstimate={handleViewEstimate}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Estimate Modal */}
      <EstimateModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={detailsRequest}
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
      />
    </div>
  );
}
