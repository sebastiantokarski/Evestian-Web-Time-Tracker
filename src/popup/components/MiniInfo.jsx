import React, {Component} from 'react';

export default class MiniInfo extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="mini-info__section">
        <div className="container">
          <div className="mini-info__wrapper">
            <span className="mini-info__content">
              You spent <span id="totalTime"></span> on <span id="totalDomains"></span> sites
            </span>
          </div>
        </div>
      </div>
    );
  }
}
