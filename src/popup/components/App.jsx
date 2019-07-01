import React, {Component, Fragment} from 'react';
import Header from './Header.jsx';
import MiniInfo from './MiniInfo.jsx';
import MainTabs from './MainTabs.jsx';
import Footer from './Footer.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import '../../scss/popup.scss';

export default class App extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <Fragment>
        <Header/>
        <MiniInfo/>
        <MainTabs/>
        <Footer />
      </Fragment>
    );
  }
}
