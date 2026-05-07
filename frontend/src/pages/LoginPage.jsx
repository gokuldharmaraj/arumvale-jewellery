import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Store, Shield, Mail, Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import loginBackground from "@/assets/loginbackground.jpg";
import styles from "./LoginPage.module.css";
const roles = [{
  key: "user",
  label: "Customer",
  icon: User,
  desc: "Browse & compare jewellery"
}, {
  key: "vendor",
  label: "Shop Owner",
  icon: Store,
  desc: "Manage your jewellery shop"
}, {
  key: "admin",
  label: "Admin",
  icon: Shield,
  desc: "Platform administration"
}];
export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    login
  } = useAuth();
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await login(email, password);
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    toast({
      title: "Login Successful",
      description: `Welcome back!`
    });
    if (selectedRole === "admin") navigate("/admin");else if (selectedRole === "vendor") navigate("/vendor");else navigate("/");
    setLoading(false);
  };
  return <div className={styles.loginPage} style={{
      backgroundImage: `url(${loginBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        {/* Glass Container */}
        <div className={styles.glassContainer}>
          {/* Header */}
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoText}>Arumvale</span>
            </Link>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your account</p>
          </div>

          {/* Role Selector */}
          <div className={styles.roleSelector}>
            {roles.map(role => <button key={role.key} onClick={() => setSelectedRole(role.key)} className={`${styles.roleButton} ${selectedRole === role.key ? styles.active : ''}`}>
                <role.icon className={styles.roleIcon} />
                <span className={styles.roleLabel}>{role.label}</span>
              </button>)}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <Input type={showPassword ? "text" : "password"} placeholder="*************" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className={styles.formFooter}>
            <label className={styles.rememberLabel}>
              <input type="checkbox" className={styles.checkbox} />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? <Loader2 className={`${styles.spinner} mr-2`} /> : null}
            Sign In as {roles.find(r => r.key === selectedRole)?.label}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.footerLink}>Create Account</Link>
          {" · "}
          <Link to="/register/vendor" className={styles.footerLink}>Register as Shop Owner</Link>
        </p>
        </div>
      </div>
    </div>;
}
