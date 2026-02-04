import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeLog } from '../../utils/security';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using sanitizeLog to prevent leakage
    console.error('Uncaught error:', sanitizeLog(error));
    if (errorInfo && errorInfo.componentStack) {
        // Allow a bit more length for stack traces, but still sanitized
        console.error('Component stack:', sanitizeLog(errorInfo.componentStack, 500));
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong.</h1>
            <p className="text-slate-600 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
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
  children: PropTypes.node
};

export default ErrorBoundary;
