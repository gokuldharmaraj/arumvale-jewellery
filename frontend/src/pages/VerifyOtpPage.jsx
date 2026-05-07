import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import styles from "./VerifyOtpPage.module.css";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email from location state or query params
  const email = location.state?.email || new URLSearchParams(location.search).get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Verified",
          description: data.message,
        });
        navigate("/reset-password", { state: { email } });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.verifyOtpContainer}>
      <div className={styles.verifyOtpCard}>
        <div className={styles.header}>
          <Link to="/forgot-password" className={styles.backLink}>
            <ArrowLeft size={20} />
            Back to Forgot Password
          </Link>
          <div className={styles.iconContainer}>
            <Shield size={48} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Verify OTP</h1>
          <p className={styles.subtitle}>
            Enter the 6-digit OTP sent to your email address
          </p>
          {email && (
            <p className={styles.emailText}>
              <Mail size={16} className={styles.emailIcon} />
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>
              6-Digit OTP
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="******"
              maxLength={6}
              required
              className={styles.input}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                Verifying OTP...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Didn't receive the OTP?{" "}
            <Link to="/forgot-password" className={styles.link}>
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
