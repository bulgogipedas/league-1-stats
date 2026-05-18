import React from "react";
import ErrorMessage from "../ui/ErrorMessage.jsx";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} context="dashboard" onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
