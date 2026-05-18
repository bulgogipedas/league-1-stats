import React from "react";

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
      return (
        <section className="border border-loss bg-white p-6">
          <h1 className="text-lg font-semibold text-loss">Dashboard error</h1>
          <p className="mt-2 text-sm text-muted">{this.state.error.message}</p>
        </section>
      );
    }
    return this.props.children;
  }
}
