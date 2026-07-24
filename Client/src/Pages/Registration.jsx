import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ✅ UPDATED — added state, was missing before (Confirm Password field had no onChange at all)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ UPDATED — added, disables button + shows loading state while request is in flight

  const handleSubmission = async (e) => {
    e.preventDefault();

    // ✅ UPDATED — added basic client-side validation before hitting the API
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true); // ✅ UPDATED

    try {
      const response = await fetch('https://shopmern-9ggl.onrender.com/api/users/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber
        })
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        navigate('/login');
      } else {
        // ✅ UPDATED — surfaces real backend error instead of failing silently
        alert(data.message || "Failed to create account. Please try again.");
      }

    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please check your connection and try again."); // ✅ UPDATED — surfaces network/crash errors
    } finally {
      setIsSubmitting(false); // ✅ UPDATED
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left — Image ── */}
      <div className="hidden lg:block relative">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
          <h2 className="text-white text-4xl font-bold uppercase tracking-widest mb-3">
            ShopMern
          </h2>
          <p className="text-gray-300 text-sm tracking-widest">
            Join thousands of fashion lovers today
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
              Create Account
            </h2>
            <p className="text-sm text-gray-400 tracking-wide">
              Sign up to start shopping with us
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmission} className="flex flex-col gap-5">

            {/* First + Last Name */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <Label className="text-xs uppercase tracking-widest text-gray-500">
                  First Name
                </Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="John"
                    value={firstName} // ✅ UPDATED — made controlled input (was missing value prop)
                    className="pl-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <Label className="text-xs uppercase tracking-widest text-gray-500">
                  Last Name
                </Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={lastName} // ✅ UPDATED — made controlled input
                    className="pl-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

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
                  value={email} // ✅ UPDATED — made controlled input
                  className="pl-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-gray-500">
                Phone Number
              </Label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+92 300 0000000"
                  value={phoneNumber} // ✅ UPDATED — made controlled input
                  className="pl-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-gray-500">
                Password
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password} // ✅ UPDATED — made controlled input
                  className="pl-9 pr-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-gray-500">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword} // ✅ UPDATED — was completely unwired before, had no value or onChange
                  className="pl-9 pr-9 text-sm border-gray-200 focus:border-black rounded-none h-11"
                  onChange={(e) => setConfirmPassword(e.target.value)} // ✅ UPDATED — added, this was missing entirely
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-3.5 h-3.5 accent-black cursor-pointer mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-xs text-gray-500 uppercase tracking-widest cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <span className="text-black underline underline-offset-2 hover:text-gray-600 cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-black underline underline-offset-2 hover:text-gray-600 cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isSubmitting} // ✅ UPDATED — prevents double-submit while request is in flight
              className="w-full bg-black text-white text-xs uppercase tracking-widest py-5 hover:bg-gray-800 rounded-none mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"} {/* ✅ UPDATED — loading label */}
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
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4"
              />
              Continue with Google
            </Button>

            {/* Login Link */}
            <p className="text-xs text-center text-gray-400 uppercase tracking-widest">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black font-medium hover:text-gray-600 transition-colors underline underline-offset-2"
              >
                Sign In
              </Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}

export default Register;