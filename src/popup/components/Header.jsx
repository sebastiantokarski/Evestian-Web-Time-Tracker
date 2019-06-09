import React, { Component } from 'react';

export default class Header extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <header className="header">
        <div className="header__top-space"></div>
        <div className="header__main-row">
          <img className="header__logo" src="../../assets/icon32White.png"/>
          <h1 className="header__title">Evestian Web Time Tracker</h1>
        </div>
      </header>
    );
  }
}
