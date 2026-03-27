import React from 'react';
import PropTypes from 'prop-types';
import logger from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    logger.error('React lifecycle error', error);
    // Suppress logging errorInfo which contains full stack traces.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-neutral-400">An unexpected error occurred. Please refresh the page.</p>
          <button
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
            onClick={() => window.location.reload()}
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
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
