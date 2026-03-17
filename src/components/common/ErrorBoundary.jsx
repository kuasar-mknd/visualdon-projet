import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger from '../../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using the secure logger, which sanitizes and suppresses stack traces
    logger.error('React Lifecycle Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return a sanitized fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
          <div className="glass-panel p-8 rounded-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong.</h2>
            <p className="mb-6">We encountered an unexpected error. Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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
