import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page">
          <p className="alert alert--err">{this.state.error.message || 'Something went wrong.'}</p>
          <Link to="/" className="btn btn--primary">
            Back to overview
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
