'use client';

import { Component } from 'react';
import { Link } from '@/lib/router';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

// Catches render errors (including failed lazy chunk loads) below it and shows
// a friendly fallback instead of a blank page. Pass `resetKey` (the current
// pathname) so the error clears as soon as the visitor navigates elsewhere.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected error while rendering the page:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section
        role="alert"
        data-testid="error-boundary"
        className="min-h-[70vh] flex items-center justify-center px-6 pt-32 pb-24 bg-white"
      >
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-6">
            <AlertTriangle className="w-8 h-8 text-[#02028B]" aria-hidden="true" />
          </div>
          <h1 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            This page ran into an unexpected problem. Reloading usually fixes it.
            If it keeps happening, head back to the home page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#02028B] px-8 py-4 text-sm font-medium text-white hover:bg-[#0303b5] hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reload
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#02028B]/20 px-8 py-4 text-sm font-medium text-[#02028B] hover:bg-blue-50 transition-all duration-300"
            >
              Go to home page
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
