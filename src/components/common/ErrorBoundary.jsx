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
    // Log the error using our secure logger
    logger.error("React Error Boundary caught an error:", error);
    // You could also send this to an external logging service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Oops, something went wrong.</h2>
            <p className="text-slate-300 mb-6">
              We&apos;ve encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
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
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
