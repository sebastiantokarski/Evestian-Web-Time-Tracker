import React, {Component} from 'react';

export default class Header extends Component {
  constructor() {
    super();

    this.assets = '../../assets/';
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu(ev) {
    const btn = ev.target;
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

                <img className="header__menu-trigger header-svg"
                  src={ `${this.assets}menuWhite.svg` }
                  onClick={(ev) => this.toggleMenu(ev)}/>

                <img className="header__menu-settings header-svg"
                  src={ `${this.assets}settings.svg` }/>

                <img className="header__menu-app-switch header-svg"
                  src={ `${this.assets}powerWhite.svg` }/>

                <img className="header__menu-info header-svg"
                  src={ `${this.assets}infoWhite.svg` }/>

                <img className="header__menu-close header-svg"
                  src={ `${this.assets}closeWhite.svg` }
                  onClick={(ev) => this.toggleMenu(ev)}/>

              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
