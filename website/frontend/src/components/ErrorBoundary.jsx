// ERROR BOUNDARY - if a page crashes, show a calm message with "Reload" instead of a blank screen.

import { Component } from 'react';
import { translate } from '../i18n/translate';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('KidBuddy page error:', error, info.componentStack); // eslint-disable-line no-console
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="center-screen">
        <div className="card" style={{ maxWidth: 420 }}>
          <img src="/media/avatars/mascot-rabbit.png" alt="" style={{ height: 120, margin: '0 auto 10px' }} />
          <h1 className="heading">{translate('Oops!')}</h1>
          <p className="muted">{translate('Something went wrong on this page. Reloading usually fixes it.')}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            {translate('Reload')}
          </button>
        </div>
      </div>
    );
  }
}
