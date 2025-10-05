import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component to catch and display unexpected errors
 * Implements requirement 1.4: Comprehensive error handling for all failure scenarios
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-header">
              <span className="error-boundary-icon">💥</span>
              <h1 className="error-boundary-title">Oops! Something went wrong</h1>
            </div>
            
            <div className="error-boundary-message">
              <p>
                The application encountered an unexpected error and couldn't continue. 
                This is likely a temporary issue.
              </p>
            </div>

            <div className="error-boundary-actions">
              <button 
                className="error-boundary-button primary"
                onClick={this.handleReset}
                type="button"
              >
                🔄 Try Again
              </button>
              
              <button 
                className="error-boundary-button secondary"
                onClick={this.handleReload}
                type="button"
              >
                🔃 Reload Page
              </button>
              
              <button 
                className="error-boundary-button tertiary"
                onClick={() => {
                  const errorDetails = encodeURIComponent(
                    `Error: ${this.state.error?.message || 'Unknown error'}\n` +
                    `Stack: ${this.state.error?.stack || 'No stack trace'}\n` +
                    `Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}`
                  );
                  window.open(
                    `https://github.com/your-repo/skillrack-tracker/issues/new?title=Application%20Error&body=${errorDetails}`,
                    '_blank'
                  );
                }}
                type="button"
              >
                🐛 Report Bug
              </button>
            </div>

            {/* Error details for debugging (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary-stack">
                  <h3>Error Message:</h3>
                  <pre>{this.state.error.message}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;