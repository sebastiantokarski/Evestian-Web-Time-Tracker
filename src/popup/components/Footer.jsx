import React, {Component} from 'react';

export default class Footer extends Component {
  constructor(props) {
    super(props);

    this.flaticonUrl = 'https://www.flaticon.com';
    this.flaticonAuthorUrl = `${this.flaticonUrl}/authors/smashicons`;
  }

  render() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="flaticon-desc">
            <p>
              Icons made by
              <a href={ this.flaticonAuthorUrl } title="Smashicons"> Smashicons </a>
              from
              <a href={ this.flaticonUrl } title="Flaticon"> www.flaticon.com </a>
              is licensed by
              <a href="http://creativecommons.org/licenses/by/3.0/"
                title="Creative Commons BY 3.0"
                rel="noopener noreferrer"
                target="_blank"> CC 3.0 BY </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }
}
