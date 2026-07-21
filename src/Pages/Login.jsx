import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // ===== VALIDATION =====
    
    // Email validation
    if (!email) {
      toast.error("Email is required", {
        description: "Please enter your email address.",
      });
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      toast.error("Invalid email format", {
        description: "Please enter a valid email address.",
      });
      return;
    }
    
    // Password validation
    if (!password) {
      toast.error("Password is required", {
        description: "Please enter your password.",
      });
      return;
    }
    if (password.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ SUCCESS
        toast.success("Welcome back! 🎉", {
          description: "You have been logged in successfully.",
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => navigate('/'), 1000);
      } else {
        // ❌ ERROR - Wrong email or password
        toast.error("Login failed", {
          description: data.message || "Invalid email or password. Please try again.",
        });
      }

    } catch (error) {
      console.log(error);
      toast.error("Network error", {
        description: "Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* ── Left — Image ── */}
        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
            <h2 className="text-white text-4xl font-bold uppercase tracking-widest mb-3">
              ShopMern
            </h2>
            <p className="text-gray-300 text-sm tracking-widest">
              Your premium fashion destination
            </p>
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div className="flex flex-col items-center justify-center px-8 py-12 bg-white">
          <div className="w-full max-w-md">

            {/* Logo — mobile only */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold uppercase tracking-widest">
                ShopMern
              </h1>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-400 tracking-wide">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-widest text-gray-500">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="pl-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-gray-500">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-9 pr-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 accent-black cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-gray-500 uppercase tracking-widest cursor-pointer"
                >
                  Remember Me
                </label>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white text-xs uppercase tracking-widest py-5 hover:bg-gray-800 rounded-none mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
                <Separator className="flex-1" />
              </div>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs uppercase tracking-widest py-5 rounded-none border-gray-200 hover:border-black gap-3"
                disabled={loading}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-4 h-4"
                />
                Continue with Google
              </Button>

              {/* Register Link */}
              <p className="text-xs text-center text-gray-400 uppercase tracking-widest">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-black font-medium hover:text-gray-600 transition-colors underline underline-offset-2"
                >
                  Create Account
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}

export default Login;