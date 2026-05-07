import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, CreditCard, Heart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import loginBackground from "@/assets/loginbackground.jpg";
import styles from "./RegisterPage.module.css";
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    signup
  } = useAuth();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });
  const update = (field, value) => setForm(prev => ({
    ...prev,
    [field]: value
  }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    const {
      error
    } = await signup(form);
    setLoading(false);
    if (error) {
      toast({
        title: "Registration Failed",
        description: error,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Registration Successful!",
      description: "Welcome to Arumvale. Please check your email to verify."
    });
    navigate("/login");
  };
  return <div className={styles.registerPage} style={{
      backgroundImage: `url(${loginBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.glassContainer}>
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoText}>Arumvale</span>
            </Link>
            <h1 className={styles.title}>Create Your Account</h1>
            <p className={styles.subtitle}>Join the smart jewellery shopping experience</p>
          </div>

          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            {[1, 2].map(s => <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepNumber} ${step >= s ? styles.active : styles.inactive}`}>{s}</div>
              {s < 2 && <div className={styles.stepLine} />}
            </div>)}
          </div>
          <p className={styles.stepDescription}>
            {step === 1 ? "Personal Information" : "Contact & Address"}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {step === 1 && (
              <div className={styles.formContent}>

                 <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Username *</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <Input
                      placeholder="arjunsharma"
                      value={form.username}
                      onChange={e => update("username", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number *</label>
                  <div className={styles.inputWrapper}>
                    <Phone className={styles.inputIcon} />
                    <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} className="pl-10" required />
                  </div>
                </div>

               

                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>First Name *</label>
                    <div className={styles.inputWrapper}>
                      <User className={styles.inputIcon} />
                      <Input
                        placeholder="Arjun"
                        value={form.firstName}
                        onChange={e => update("firstName", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Last Name *</label>
                    <Input
                      placeholder="Sharma"
                      value={form.lastName}
                      onChange={e => update("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address *</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <Input
                      type="email"
                      placeholder="arjun@example.com"
                      value={form.email}
                      onChange={e => update("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password *</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <Input type={showPassword ? "text" : "password"} placeholder="********" value={form.password} onChange={e => update("password", e.target.value)} className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm Password *</label>
                    <Input type="password" placeholder="********" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} required />
                  </div>
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Date of Birth</label>
                    <div className={styles.inputWrapper}>
                      <Calendar className={styles.inputIcon} />
                      <Input type="date" value={form.dob} onChange={e => update("dob", e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gender</label>
                    <Select value={form.gender} onValueChange={v => update("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

          {step === 2 && <div className={styles.formContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Address *</label>
                <div className={styles.inputWrapper}>
                  <Textarea placeholder="House/Flat No., Street, Locality" value={form.address} onChange={e => update("address", e.target.value)} className={styles.textarea} required />
                </div>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>City *</label>
                  <Input placeholder="Mumbai" value={form.city} onChange={e => update("city", e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>State *</label>
                  <Select value={form.state} onValueChange={v => update("state", v)}>
                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                      {["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Kerala", "Uttar Pradesh", "Telangana"].map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PIN Code *</label>
                <Input placeholder="400001" value={form.pincode} onChange={e => update("pincode", e.target.value)} required maxLength={6} />
              </div>
            </div>}

          
          <div className={styles.formButtons}>
            {step > 1 && <button type="button" className={styles.backButton} onClick={() => setStep(step - 1)}>Back</button>}
            {step < 2 ? <button type="button" className={styles.continueButton} onClick={() => {
                // Validate step 1 fields
                if (!form.username || !form.phone || !form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
                  toast({
                    title: "Missing Required Fields",
                    description: "Please fill in all required fields",
                    variant: "destructive"
                  });
                  return;
                }
                if (form.password !== form.confirmPassword) {
                  toast({
                    title: "Passwords don't match",
                    variant: "destructive"
                  });
                  return;
                }
                setStep(step + 1);
              }}>
                Continue
              </button> : <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? <Loader2 className={`${styles.spinner} mr-2}`} /> : null}
                Create Account
              </button>}
          </div>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.footerLink}>Sign In</Link>
          {" · "}
          <Link to="/register/vendor" className={styles.footerLink}>Register as Shop Owner</Link>
        </p>
        </div>
      </div>
    </div>;
}
