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

  componentDidCatch(error) {
    // Log the error securely using the centralized logger
    // Note: errorInfo is intentionally omitted to prevent leaking internal component structures
    logger.error('Unhandled UI Exception caught by ErrorBoundary', error);
  }

  render() {
    if (this.state.hasError) {
      // Return a safe, generic fallback UI
      return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-800 p-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred. Our team has been securely notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
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
