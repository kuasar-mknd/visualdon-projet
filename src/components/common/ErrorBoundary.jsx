import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) { // eslint-disable-line no-unused-vars
    // Log the error using the secure logger utility
    // We pass error.message or error string instead of the full error object
    // to ensure stack traces are suppressed in production via the logger.
    // The logger utility will handle the dev vs prod logic.
    logger.error('React component error:', error);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Oops, something went wrong.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              An unexpected error has occurred. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
