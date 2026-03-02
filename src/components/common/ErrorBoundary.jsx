import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, errorInfo) {
    // Securely log the error using our centralized logger
    logger.error("React Component Error:", error);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
             <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong.</h2>
             <p className="text-slate-300 mb-6">An unexpected error has occurred. Please refresh the page or try again later.</p>
             <button
               onClick={() => window.location.reload()}
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
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
