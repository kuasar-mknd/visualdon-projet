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
    // Log the error using our centralized, secure logger
    // Pass the Error object directly to let logger sanitize and extract .message
    logger.error('React component error:', error);

    // errorInfo.componentStack contains the component stack trace.
    // We log it separately (also sanitized by logger) just in case we need context.
    // In strict production setups, we might even avoid logging this to console,
    // but the logger sanitizes it up to 500 chars and removes control chars.
    if (errorInfo && errorInfo.componentStack) {
      logger.error('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong.</h1>
          <p className="text-gray-400">An unexpected error occurred. The details have been logged securely.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
          >
            Refresh Page
          </button>
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
