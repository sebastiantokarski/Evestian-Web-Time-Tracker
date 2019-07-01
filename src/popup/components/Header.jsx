import React, {Component} from 'react';

export default class Header extends Component {
  constructor() {
    super();

    this.assets = '../../assets/';
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu(ev) {
    ev.preventDefault();

    const btn = ev.target.parentNode;
    const menuWrapper = btn.parentNode;
    const headerTitle = menuWrapper.previousElementSibling;
    const headerLogo = headerTitle.previousElementSibling;

    menuWrapper.classList.toggle('opened');
    headerTitle.classList.toggle('opened-menu');
    headerLogo.classList.toggle('opened-menu');
  }

  render() {
    return (
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="header__main-row">
              <img className="header__logo" src={ `${this.assets}logoWhite.svg`}/>
              <h1 className="header__title">Evestian Web Time Tracker</h1>
              <div className="header__menu-wrapper">

                <a href="#" className="header__menu-trigger" onClick={(ev) => this.toggleMenu(ev)} title="Menu">
                  <img className="header-svg" src={ `${this.assets}menuWhite.svg` }/>
                </a>

                <a href="#" className="header__menu-settings" title="Settings">
                  <img className="header-svg" src={ `${this.assets}settings.svg` }/>
                </a>

                <a href="#" className="header__app-switch" title="Turn off">
                  <img className="header-svg" src={ `${this.assets}powerWhite.svg` }/>
                </a>

                <a href="#" className="header__menu-info" title="How it works">
                  <img className="header-svg" src={ `${this.assets}infoWhite.svg` }/>
                </a>

                <a href="#" className="header__menu-close" onClick={(ev) => this.toggleMenu(ev)} title="Close menu">
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
