import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our secure logger
    // The logger will handle sanitization and stack trace suppression in production
    logger.error('React Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return the fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-red-500/30 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-slate-300 mb-6">
              An unexpected error occurred in the application. We have logged the issue and are looking into it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
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
