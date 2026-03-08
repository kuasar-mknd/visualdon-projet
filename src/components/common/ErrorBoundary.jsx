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
    // Log the error using the centralized logger utility to prevent leaks in production
    logger.error('React Lifecycle Error:', error, 'ErrorInfo componentStack:', errorInfo ? errorInfo.componentStack : '');
  }

  render() {
    if (this.state.hasError) {
      // Return a generic fallback UI to prevent exposing internal state or stack traces
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-8">
          <div className="glass-panel p-8 rounded-2xl max-w-lg text-center shadow-xl border border-red-500/20">
            <h1 className="text-3xl font-bold mb-4 text-red-400">Oops! Something went wrong.</h1>
            <p className="text-slate-300 mb-6">
              We encountered an unexpected error while rendering this page. The application has been safely halted to prevent any security issues.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-slate-900"
            >
              Reload Application
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
