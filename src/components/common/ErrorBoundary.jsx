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
    // Log the error using our secure logger to prevent stack trace leaks
    logger.error('React Lifecycle Error:', error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-slate-900 text-white">
          <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h2>
            <p className="text-slate-300">
              An unexpected error occurred. The application has been secured, and the issue has been logged.
            </p>
            <button
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
              onClick={() => window.location.reload()}
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
