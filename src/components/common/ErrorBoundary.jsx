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
    // Log the error to our centralized logging service
    logger.error('Caught error in ErrorBoundary:', error);
    logger.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
            <p className="text-slate-300 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
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
