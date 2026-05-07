import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Store, FileText, Building, Globe, CreditCard, Award, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
export default function VendorRegisterPage() {
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
    ownerName: "",
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gstNumber: "",
    panNumber: "",
    bisHallmark: "",
    shopAddress: "",
    city: "",
    state: "",
    pincode: "",
    shopType: "",
    yearsInBusiness: "",
    website: "",
    description: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
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
    
    // Prepare vendor registration data
    const vendorData = {
      ...form,
      role: "vendor",
      firstName: form.ownerName,
      lastName: "", // Vendor registration only has owner name
      username: form.shopName.toLowerCase().replace(/\s+/g, '_'), // Generate username from shop name
      address: {
        fullAddress: form.shopAddress,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: "India"
      }
    };
    
    const {
      error
    } = await signup(vendorData);
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
      title: "Vendor Registration Submitted!",
      description: "Your application will be reviewed within 24-48 hours."
    });
    navigate("/login");
  };
  return <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="font-display text-2xl font-bold gold-text">Arumvale</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Store className="h-3.5 w-3.5" /> Shop Owner Registration
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Register Your Jewellery Shop</h1>
          <p className="text-muted-foreground text-sm mt-1">List your products on the smart comparison platform</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map(s => <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
              {s < 4 && <div className={`w-6 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>)}
        </div>
        <p className="text-center text-xs text-muted-foreground mb-4">
          {step === 1 ? "Owner Details" : step === 2 ? "Shop Information" : step === 3 ? "Business Documents" : "Bank Details"}
        </p>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {step === 1 && <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Owner Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rajesh Kumar" value={form.ownerName} onChange={e => update("ownerName", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="shop@example.com" value={form.email} onChange={e => update("email", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password *</label>
                  <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} required />
                </div>
              </div>
            </div>}

          {step === 2 && <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Shop / Business Name *</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Sharma Jewellers Pvt. Ltd." value={form.shopName} onChange={e => update("shopName", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Shop Type *</label>
                  <Select value={form.shopType} onValueChange={v => update("shopType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Years in Business</label>
                  <Select value={form.yearsInBusiness} onValueChange={v => update("yearsInBusiness", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-5">1 – 5 years</SelectItem>
                      <SelectItem value="5-10">5 – 10 years</SelectItem>
                      <SelectItem value="10-20">10 – 20 years</SelectItem>
                      <SelectItem value="20+">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Shop Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea placeholder="Shop No., Building, Street, Area" value={form.shopAddress} onChange={e => update("shopAddress", e.target.value)} className="pl-10 min-h-[80px]" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <Input placeholder="Mumbai" value={form.city} onChange={e => update("city", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">State *</label>
                  <Select value={form.state} onValueChange={v => update("state", v)}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      {["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Kerala"].map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">PIN *</label>
                  <Input placeholder="400001" value={form.pincode} onChange={e => update("pincode", e.target.value)} required maxLength={6} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Website (optional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="https://www.yourshop.com" value={form.website} onChange={e => update("website", e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Shop Description</label>
                <Textarea placeholder="Brief description of your jewellery business, specialties, USPs..." value={form.description} onChange={e => update("description", e.target.value)} className="min-h-[80px]" />
              </div>
            </div>}

          {step === 3 && <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground mb-2">
                <Award className="h-4 w-4 text-primary inline mr-1.5" />
                Business documents help verify your shop and build trust with customers.
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">GST Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">PAN Number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="ABCDE1234F" value={form.panNumber} onChange={e => update("panNumber", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">BIS Hallmark License No.</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="BIS-XXXXX-XXXX" value={form.bisHallmark} onChange={e => update("bisHallmark", e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>}

          {step === 4 && <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground mb-2">
                <Building className="h-4 w-4 text-primary inline mr-1.5" />
                Bank details are required for payment settlements.
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Bank Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="State Bank of India" value={form.bankName} onChange={e => update("bankName", e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Account Number *</label>
                <Input placeholder="XXXXXXXXXXXX" value={form.accountNumber} onChange={e => update("accountNumber", e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">IFSC Code *</label>
                <Input placeholder="SBIN0001234" value={form.ifscCode} onChange={e => update("ifscCode", e.target.value)} required />
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-border mt-0.5" required />
                I confirm all details are accurate and agree to the <a href="#" className="text-primary hover:underline">Vendor Agreement</a>
              </label>
            </div>}

          <div className="flex gap-3 mt-6">
            {step > 1 && <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 4 ? <Button type="button" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setStep(step + 1)}>
                Continue
              </Button> : <Button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Application
              </Button>}
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already registered? <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          {" · "}
          <Link to="/register" className="text-primary hover:underline font-medium">Register as Customer</Link>
        </p>
      </div>
    </div>;
}
