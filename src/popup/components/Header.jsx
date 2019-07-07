import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import MessageHandler from '../../js/MessageHandler';
import settings from '../../js/settings';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedMenu: false,
      isAppEnabled: true,
    };

    this.assetsDir = '../../assets/';
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  async isAppEnabled() {
    await settings.load();

    const isEnabled = settings.IS_ENABLED;

    this.setState({ isAppEnabled: isEnabled });

    return isEnabled;
  }

  async switchExtension(ev) {
    ev.preventDefault();

    this.setState({ isAppEnabled: !this.state.isAppEnabled });

    const action = this.state.isAppEnabled ? 'disable' : 'enable';

    settings.setSetting('IS_ENABLED', this.state.isAppEnabled);

    MessageHandler.sendMessage({ action });
  }

  toggleMenu(ev) {
    ev.preventDefault();

    this.setState({ openedMenu: !this.state.openedMenu });
  }

  componentWillMount() {
    this.isAppEnabled();
  }

  render() {
    return (
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="header__main-row">
              <img
                className={ `header__logo${this.state.openedMenu ? ' opened-menu' : ''}` }
                src={ `${this.assetsDir}logoWhite.svg`} />
              <h1 className={ `header__title${this.state.openedMenu ? ' opened-menu' : ''}` }>
                Evestian Web Time Tracker
              </h1>
              <div className={ `header__menu-wrapper${this.state.openedMenu ? ' opened' : ''}` }>

                <a href="#" className="header__menu-trigger menu-item"
                  onClick={(ev) => this.toggleMenu(ev)}
                  title="Menu">
                  <img className="header-svg" src={ `${this.assetsDir}menuWhite.svg` }/>
                </a>

                <Popup trigger={
                  <a href="#" className="header__menu-settings menu-item" title="Settings">
                    <img className="header-svg" src={ `${this.assetsDir}settings.svg` }/>
                  </a>
                } modal>
                  <div>Extension Settings</div>
                </Popup>

                <a href="#"
                  className="header__menu-app-switch menu-item"
                  title={ this.state.isAppEnabled ? 'Turn off' : 'Turn on' }
                  onClick={(ev) => this.switchExtension(ev)}>
                  <img className="header-svg" src={ `${this.assetsDir}powerWhite.svg` }/>
                </a>

                <Popup trigger={
                  <a href="#" className="header__menu-info menu-item" title="How it works">
                    <img className="header-svg" src={ `${this.assetsDir}infoWhite.svg` }/>
                  </a>
                } modal>
                  <div className="container">
                    <div className="text-center">
                      <h5>How it works</h5>
                    </div>
                    <div className="text-center">
                      <p>
                        Rozszerzenie liczy każdą spędzoną sekunde na każdej stronie.
                        Statystyki liczone są per domena. Żadne dane nie są wysyłane na zewnątrz.
                      </p>
                    </div>
                  </div>
                </Popup>

                <a href="#" className="header__menu-close menu-item"
                  onClick={(ev) => this.toggleMenu(ev)}
                  title="Close menu">
                  <img className="header-svg" src={ `${this.assetsDir}closeWhite.svg` }/>
                </a>

              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
