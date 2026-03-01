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

  componentDidCatch(error, errorInfo) { // eslint-disable-line no-unused-vars
    // Log the error using the centralized logger
    logger.error('React ErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
             <p className="text-slate-600 mb-6">
                An unexpected error occurred. Please try refreshing the page.
             </p>
             <button
               onClick={() => window.location.reload()}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default ErrorBoundary;


ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
