import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header.jsx';
import MiniInfo from './components/MiniInfo.jsx';
import MainTabs from './components/MainTabs.jsx';
import Footer from './components/Footer.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/popup.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
    };
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

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
