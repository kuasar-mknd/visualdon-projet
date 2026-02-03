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
    // Log the error securely
    console.error("Uncaught error:", sanitizeLog(error.message));
    // We could also log errorInfo.componentStack but it might be large.
    // For now, let's keep it simple and safe.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
             </div>
             <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
             <p className="text-slate-600 mb-6">We&apos;re sorry, but an unexpected error occurred. Please try refreshing the page.</p>
             <button
               onClick={() => window.location.reload()}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors focus:ring-4 focus:ring-blue-200 outline-none"
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
