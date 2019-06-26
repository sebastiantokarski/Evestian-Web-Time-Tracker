import React, {Component} from 'react';

export default class Header extends Component {
  constructor() {
    super();

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu(ev) {
    const btn = ev.target;
    const menuWrapper = btn.parentNode;
    const headerTitle = menuWrapper.previousElementSibling;

    menuWrapper.classList.toggle('opened');
    headerTitle.classList.toggle('opened-menu');
  }

  render() {
    return (
      <header className="header">
        <div className="header__top-space"></div>
        <div className="container">
          <div className="row">
            <div className="header__main-row">
              <img className="header__logo" src="../../assets/icon32White.png"/>
              <h1 className="header__title">Evestian Web Time Tracker</h1>
              <div className="header__menu-wrapper">
                <img className="header__menu-trigger menu-svg" src="../../assets/menuWhite.svg"
                     onClick={(ev) => this.toggleMenu(ev)}/>
                <img className="header__menu-app-switch menu-svg" src="../../assets/powerWhite.svg"/>
                <img className="header__menu-settings menu-svg" src="../../assets/settings.svg"/>
                <img className="header__menu-close menu-svg" src="../../assets/closeWhite.svg"
                     onClick={(ev) => this.toggleMenu(ev)}/>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
