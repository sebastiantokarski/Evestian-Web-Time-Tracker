import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  showModal() {
    this.setState({ show: true });
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  hideModal() {
    this.setState({ show: false });
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick(e) {
    if (!this.state.show) {
      return;
    }

    if (!this.modal.contains(e.target)) {
      this.hideModal();
    }
  }

  render() {
    if (!this.state.show) {
      return React.cloneElement(this.props.trigger, { onClick: this.showModal });
    }
    return (
      <Fragment>
        { this.props.trigger }
        <div className={ `modal-overlay${this.state.show ? ' active' : ''}` }>
          <div className="modal-content" ref={(ref) => this.modal = ref }>
            <div className="container">
              <a className="modal-hide" onClick={ this.hideModal }>&times;</a>
              <h5 className="modal-title">{ this.props.title }</h5>
              { this.props.children }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

Modal.propTypes = {
  trigger: PropTypes.element,
  title: PropTypes.string,
  children: PropTypes.element,
};
