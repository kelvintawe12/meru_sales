import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Props = { children: React.ReactNode };
type State = {
  hasError: boolean;
  error: any;
  errorInfo: any;
  isRetrying: boolean;
  timestamp: string | null;
};

const letters = ["M", "E", "R", "U"]; // For mini-loader during retry

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      timestamp: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      error,
      timestamp: new Date().toLocaleString("en-US", { timeZone: "Africa/Lusaka" }), // CAT
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    // Placeholder for error logging (e.g., Sentry)
    console.error("ErrorBoundary caught an error", {
      error,
      errorInfo,
      timestamp: this.state.timestamp,
      location: window.location.pathname,
      userId: "mock-user-123", // Replace with actual user context
    });
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });
    setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null, isRetrying: false });
    }, 1500); // Simulate retry with mini-loader
  };

  handleGoHome = () => {
    window.location.href = "/"; // Force navigation to dashboard
  };

  handleReportIssue = () => {
    // Placeholder for reporting (e.g., API call or email)
    console.log("Reporting issue:", {
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      timestamp: this.state.timestamp,
    });
    alert("Error reported. Thank you!");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#3C2F2F] to-[#4A3728] bg-opacity-95">
          {this.state.isRetrying ? (
            <div className="flex space-x-2 text-3xl font-extrabold text-[#EF4444]">
              {letters.map((letter, i) => (
                <span
                  key={letter}
                  className="inline-block animate-meru-retry"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1.5s",
                    animationIterationCount: "infinite",
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <div className="relative max-w-2xl w-full mx-4 p-8 rounded-lg shadow-2xl">
              {/* Emblem */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl font-serif text-[#FFD70066] animate-pulse-slow">
                M
              </div>
              {/* Error Content */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#EF4444] mb-4">
                  Oops, Something Went Wrong
                </h2>
                <p className="text-[#FACC15] mb-6">
                  An unexpected error occurred at {this.state.timestamp} (CAT).
                </p>
                <div className="text-left bg-[#4A3728] bg-opacity-50 p-4 rounded-lg mb-6 border border-[#8B4513]">
                  <h3 className="text-lg font-semibold text-[#EF4444] mb-2">
                    Error Details
                  </h3>
                  <pre className="text-sm text-[#FACC15] overflow-auto max-h-40">
                    {String(this.state.error)}
                    {this.state.errorInfo && (
                      <>
                        <br />
                        Component Stack:
                        <br />
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-[#FACC15] text-[#3C2F2F] font-semibold rounded hover:bg-[#EAB308] transition"
                  >
                    Retry
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="px-4 py-2 bg-[#8B4513] text-[#FACC15] font-semibold rounded hover:bg-[#5C4033] transition"
                  >
                    Go Home
                  </button>
                  <button
                    onClick={this.handleReportIssue}
                    className="px-4 py-2 bg-transparent border border-[#EF4444] text-[#EF4444] font-semibold rounded hover:bg-[#EF4444] hover:text-[#FACC15] transition"
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          )}
          <style>
            {`
              @keyframes meru-retry {
                0% {
                  transform: translateY(0) scale(1);
                  color: #EF4444;
                  text-shadow: 0 0 8px #EF444466;
                  opacity: 0.7;
                }
                50% {
                  transform: translateY(-10px) scale(1.1);
                  color: #FACC15;
                  text-shadow: 0 0 8px #FACC1566;
                  opacity: 1;
                }
                100% {
                  transform: translateY(0) scale(1);
                  color: #8B4513;
                  text-shadow: 0 0 8px #8B451366;
                  opacity: 0.7;
                }
              }
              @keyframes pulse-slow {
                0% {
                  opacity: 0.5;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.7;
                  transform: scale(1.1);
                }
                100% {
                  opacity: 0.5;
                  transform: scale(1);
                }
              }
              .animate-meru-retry {
                animation-name: meru-retry;
                animation-timing-function: ease-in-out;
              }
              .animate-pulse-slow {
                animation: pulse-slow 2.5s ease-in-out infinite;
              }
            `}
          </style>
        </div>
      );
    }
    return this.props.children;
  }
}