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

  componentDidCatch(error, errorInfo) { // eslint-disable-line no-unused-vars
    // Log the error to an error reporting service
    // Use sanitizeLog to prevent leaking sensitive info or flooding logs
    console.error("ErrorBoundary caught an error:", sanitizeLog(error));

    // We can also log component stack if needed, but keeping it simple and safe for now
    // console.error("Component Stack:", sanitizeLog(errorInfo.componentStack));
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <p className="text-slate-600 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
