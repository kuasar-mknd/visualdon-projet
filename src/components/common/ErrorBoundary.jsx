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
    // Log the error using the secure logger, which sanitizes the message
    // and prevents full stack traces from leaking in production.
    logger.error("React Lifecycle Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return a sanitized fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-sans p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-red-400">Something went wrong</h2>
            <p className="text-slate-300 mb-6">
              An unexpected error occurred in the application. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-blue-500 rounded text-white font-medium transition-colors outline-none"
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
