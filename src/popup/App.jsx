import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import Header from './components/Header.jsx';
import '../scss/app.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      title: ""
    };
  }
  render() {
    return (
      <Fragment>
        <Header/>
      </Fragment>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
