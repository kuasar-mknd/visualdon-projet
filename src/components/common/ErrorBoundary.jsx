import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our centralized, secure logger.
    // In production, the logger will automatically strip the stack trace.
    logger.error('React component error:', error);
    // You could also log errorInfo.componentStack if needed, but it may contain sensitive structure data.
    // We omit it here for security, or we could pass it to logger which truncates it.
    logger.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      // Important: Never display the actual error message or stack trace to the user
      // as it could leak internal application structure or sensitive data.
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">
          <div className="max-w-md w-full glass-panel-light rounded-2xl p-8 text-center shadow-2xl border-red-500/30 border">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-500/20 rounded-full">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white tracking-tight">Something went wrong</h1>
            <p className="text-slate-300 mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this page. The issue has been securely logged.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors shadow-lg shadow-blue-500/30 w-full sm:w-auto"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
