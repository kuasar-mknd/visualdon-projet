import React from 'react';
import PropTypes from 'prop-types';
import logger from '../../utils/logger';

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
    // Log the error using our centralized, safe logger
    logger.error('Unhandled React Error:', error);
    // Log component stack trace safely (dev only stack will show full, prod will sanitize)
    logger.error('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div
          className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-200"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md p-8 bg-slate-800 rounded-lg shadow-xl text-center border border-slate-700">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong.
            </h1>
            <p className="text-slate-400 mb-6">
              An unexpected error has occurred. We have securely logged the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
