import React from 'react';

interface ModalProps {
  trigger: React.ReactElement;
  title: string;
  children: React.ReactElement;
}

const Modal: React.FC<ModalProps> = (props) => {
  // @TODO Add modal
  return null;
  // return (
  //   <Fragment>
  //     {trigger}
  //     <div className={`modal-overlay${this.state.show ? ' active' : ''}`}>
  //       <div className="modal-content" ref={(ref) => (this.modal = ref)}>
  //         <div className="container">
  //           <a className="modal-hide" onClick={this.hideModal}>
  //             &times;
  //           </a>
  //           <h5 className="modal-title">{title}</h5>
  //           {this.props.children}
  //         </div>
  //       </div>
  //     </div>
  //   </Fragment>
  // );
};

export default Modal;
