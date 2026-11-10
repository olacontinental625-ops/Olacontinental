import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#051421] text-[#FAF4E8] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#071A2B] border border-[#1E486A] rounded-2xl p-8 shadow-2xl space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#FAF4E8]">
              Ola Continental Properties & Associates
            </h2>
            <p className="text-xs text-[#FAF4E8]/80 leading-relaxed">
              We experienced a temporary rendering glitch. Our system has automatically safely recovered.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#8B6347] hover:bg-[#9E7353] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
