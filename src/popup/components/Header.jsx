import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import MessageHandler from '../../js/MessageHandler';
import thenChrome from 'then-chrome';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.assets = '../../assets/';
    this.toggleMenu = this.toggleMenu.bind(this);

    this.menuWrapper = React.createRef();
    this.headerTitle = React.createRef();
    this.headerLogo = React.createRef();
  }

  async switchExtension(ev) {
    ev.preventDefault();

    const storageOption = await thenChrome.storage.local.get('enabled');
    let action = 'enable';

    if (storageOption.enabled) {
      action = 'disable';
    }

    MessageHandler.sendMessage({ action });
  }

  toggleMenu(ev) {
    ev.preventDefault();

    this.menuWrapper.current.classList.toggle('opened');
    this.headerTitle.current.classList.toggle('opened-menu');
    this.headerLogo.current.classList.toggle('opened-menu');
  }

  render() {
    return (
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="header__main-row">
              <img className="header__logo"
                src={ `${this.assets}logoWhite.svg`}
                ref={ this.headerLogo }/>
              <h1 className="header__title"
                ref={ this.headerTitle }>Evestian Web Time Tracker</h1>
              <div className="header__menu-wrapper"
                ref={ this.menuWrapper }>

                <a href="#" className="header__menu-trigger"
                  onClick={(ev) => this.toggleMenu(ev)}
                  title="Menu">
                  <img className="header-svg" src={ `${this.assets}menuWhite.svg` }/>
                </a>

                <Popup trigger={
                  <a href="#" className="header__menu-settings" title="Settings">
                    <img className="header-svg" src={ `${this.assets}settings.svg` }/>
                  </a>
                } modal>
                  <div>Extension Settings</div>
                </Popup>

                <a href="#"
                  className="header__menu-app-switch"
                  title="Turn off"
                  onClick={(ev) => this.switchExtension(ev)}>
                  <img className="header-svg" src={ `${this.assets}powerWhite.svg` }/>
                </a>

                <Popup trigger={
                  <a href="#" className="header__menu-info" title="How it works">
                    <img className="header-svg" src={ `${this.assets}infoWhite.svg` }/>
                  </a>
                } modal>
                  <div className="container">
                    <div className="text-center">
                      <h5>How it works</h5>
                    </div>
                    <div className="text-center">
                      <p>blabla</p>
                    </div>
                  </div>
                </Popup>

                <a href="#" className="header__menu-close"
                  onClick={(ev) => this.toggleMenu(ev)}
                  title="Close menu">
                  <img className="header-svg" src={ `${this.assets}closeWhite.svg` }/>
                </a>

              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
