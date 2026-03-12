import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="transform-gpu min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="transform-gpu max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 text-center space-y-8">
            <div className="transform-gpu w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle className="transform-gpu text-rose-500 w-10 h-10" />
            </div>
            
            <div className="transform-gpu space-y-3">
              <h1 className="transform-gpu text-2xl font-bold text-slate-900 tracking-tight">Something went wrong</h1>
              <p className="transform-gpu text-slate-500 text-sm font-medium leading-relaxed">
                The application encountered an unexpected error. We've logged the details and are working on a fix.
              </p>
            </div>

            {this.state.error && (
              <div className="transform-gpu bg-slate-50 rounded-2xl p-4 text-left overflow-hidden">
                <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
                <p className="transform-gpu text-xs font-mono text-rose-600 break-all leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="transform-gpu flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="transform-gpu w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                <RefreshCw size={18} />
                Reload Application
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="transform-gpu w-full py-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home size={18} />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
