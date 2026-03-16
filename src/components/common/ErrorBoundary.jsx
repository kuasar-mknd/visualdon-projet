import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React lifecycle error:', error);
    logger.info('React lifecycle error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center flex-col p-4 bg-slate-900 text-slate-100">
          <h2 className="text-2xl font-bold mb-4">An error occurred</h2>
          <p className="text-slate-400 max-w-md text-center">
            The application encountered an unexpected error.
          </p>
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
