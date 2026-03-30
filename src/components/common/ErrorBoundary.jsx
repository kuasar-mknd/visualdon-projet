import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Catch errors in components and log securely via centralized logger
    // Intentionally omitting errorInfo / componentStack to prevent leaking internal component structures
    logger.error('Caught by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      // Return a generic fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong.</h2>
            <p className="text-slate-300 mb-6">
              An unexpected error has occurred. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
