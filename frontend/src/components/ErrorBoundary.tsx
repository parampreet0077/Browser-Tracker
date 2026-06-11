'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught runtime error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-gray-100 p-6">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-8 border border-red-500/20 text-center flex flex-col gap-5">
            <div className="p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 w-fit mx-auto">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Runtime Error
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-mono bg-black/40 p-3 rounded-lg border border-white/5 text-left break-all">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/"
                className="px-6 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all"
              >
                Back to Scan
              </a>
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 rounded-lg bg-primary text-background font-black text-xs hover:bg-primary/90 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
