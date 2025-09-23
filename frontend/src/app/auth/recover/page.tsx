"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { recoveryApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import SocialAuthButtons from "@/components/SocialAuthButtons";

interface RecoveryMethod {
  method: string;
  name: string;
  icon: string;
  description: string;
}

const RECOVERY_METHODS: Record<string, RecoveryMethod> = {
  email: {
    method: "email",
    name: "Email",
    icon: "📧",
    description: "Send OTP code to your email"
  },
  google: {
    method: "google",
    name: "Google",
    icon: "🔍",
    description: "Sign in with Google"
  },
  github: {
    method: "github",
    name: "GitHub",
    icon: "🐙",
    description: "Sign in with GitHub"
  },
  discord: {
    method: "discord",
    name: "Discord",
    icon: "💬",
    description: "Sign in with Discord"
  }
};

function RecoveryPageContent() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "methods" | "verify">("email");
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();

  // Check if email is provided in URL
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setStep("methods");
      startRecovery(emailParam);
    }
  }, [searchParams]);

  const startRecovery = async (emailAddress: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await recoveryApi.startRecovery({ email: emailAddress });
      setAvailableMethods(response.available_methods);
      setWarning(response.warning || "");
      setStep("methods");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start recovery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startRecovery(email);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    
    if (method === "email") {
      setStep("verify");
      // OTP code will be sent automatically when recovery started
    } else {
      // For OAuth methods, redirect to OAuth provider
      const oauthUrl = `/api/v1/oauth/${method}`;
      window.location.href = oauthUrl;
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await recoveryApi.verifyRecovery({
        email,
        method: "email",
        code: otpCode,
      });

      setToken(response.access_token);
      setSuccess(response.message);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await recoveryApi.sendOTP({ email });
      setSuccess("OTP code sent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 flex items-center justify-center py-16">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Account Recovery</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}
        
        {warning && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg text-yellow-400 text-sm">
            {warning}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Starting Recovery..." : "Start Recovery"}
            </button>
          </form>
        )}

        {/* Step 2: Method Selection */}
        {step === "methods" && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm text-center mb-6">
              Choose a recovery method for <strong>{email}</strong>
            </p>
            
            <div className="space-y-3">
              {availableMethods.map((method) => {
                const methodInfo = RECOVERY_METHODS[method];
                if (!methodInfo) return null;
                
                return (
                  <button
                    key={method}
                    onClick={() => handleMethodSelect(method)}
                    className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{methodInfo.icon}</span>
                      <div>
                        <div className="font-medium text-white">{methodInfo.name}</div>
                        <div className="text-sm text-slate-400">{methodInfo.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === "verify" && selectedMethod === "email" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-slate-300 text-sm">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={resendOtp}
                disabled={isLoading}
                className="text-sm text-slate-400 hover:text-slate-300 underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="text-sm text-slate-400 hover:text-slate-300 underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-900 flex items-center justify-center py-16">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <RecoveryPageContent />
    </Suspense>
  );
}
