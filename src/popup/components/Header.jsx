import React, { Component } from 'react';
import MessageHandler from '../../js/MessageHandler';
import settings from '../../js/settings';
import Modal from './Modal.jsx';
import Settings from './Settings.jsx';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedMenu: false,
      isAppEnabled: true,
      settings: null,
    };

    this.assetsDir = '../../assets/';
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  async getSettings() {
    await settings.load();

    this.setState({ isAppEnabled: settings.IS_ENABLED });
    this.setState({ settings: settings.getAll() });
  }

  async switchExtension(ev) {
    ev.preventDefault();

    this.setState({ isAppEnabled: !this.state.isAppEnabled });

    const action = this.state.isAppEnabled ? 'disable' : 'enable';

    settings.set('IS_ENABLED', this.state.isAppEnabled);

    MessageHandler.sendMessage({ action });
  }

  toggleMenu(ev) {
    ev.preventDefault();

    this.setState({ openedMenu: !this.state.openedMenu });
  }

  componentWillMount() {
    this.getSettings();
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

                <Modal trigger={
                  <a href="#" className="header__menu-settings menu-item" title="Settings">
                    <img className="header-svg" src={ `${this.assetsDir}settings.svg` }/>
                  </a>
                } title="Settings">
                  <Settings/>
                </Modal>

                <a href="#"
                  className="header__menu-app-switch menu-item"
                  title={ this.state.isAppEnabled ? 'Turn off' : 'Turn on' }
                  onClick={(ev) => this.switchExtension(ev)}>
                  <img className="header-svg" src={ `${this.assetsDir}powerWhite.svg` }/>
                </a>

                <Modal trigger={
                  <a href="#" className="header__menu-info menu-item" title="How it works">
                    <img className="header-svg" src={ `${this.assetsDir}infoWhite.svg` }/>
                  </a>
                } title="How it works">
                  <p>
                    Rozszerzenie liczy każdą spędzoną sekunde na każdej stronie.
                    Statystyki liczone są per domena. Żadne dane nie są wysyłane na zewnątrz.
                  </p>
                </Modal>
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
