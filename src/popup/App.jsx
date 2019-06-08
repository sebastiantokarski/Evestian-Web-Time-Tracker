import React, { Component } from "react";
import ReactDOM from "react-dom";

class FormContainer extends Component {
  constructor() {
    super();
    this.state = {
      title: ""
    };
  }
  render() {
    return (
      <div id="article-form">
        Test
      </div>
    );
  }
}

ReactDOM.render(
  <FormContainer />,
  document.getElementById('root')
);
