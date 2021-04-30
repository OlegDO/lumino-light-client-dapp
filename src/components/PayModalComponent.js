import React from "react";
import { connect } from "react-redux";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input
} from "reactstrap";

import { changePayModal } from "../actions/channel";

import { Lumino } from "@rsksmart/lumino-light-client-sdk";
import { toWei, showInfo } from "../utils";

class PayModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: ""
    };
  }

  pay = async () => {
    const { amount } = this.state;
    const { partner, tokenName } = this.props;
    const amountWei = toWei(amount);
    const body = {
      partner: this.props.partner,
      token_address: this.props.tokenAddress,
      amount: amountWei
    };
    const message = `Sending payment of ${amount} ${tokenName} to ${partner} `;
    showInfo(message);
    this.props.toggle(null);
    await Lumino.get().actions.createPayment(body);
  };

  cancel = () => {
    this.props.toggle(null);
  };

  toggle = () => {
    let isOpen = this.props.modalOpened === this.props.modalId;
    if (isOpen) {
      // i have to close the modal
      this.props.toggle(null);
    } else {
      // i have to open it again
      this.props.toggle(this.props.modalId);
    }
  };

  handleChange = event => {
    this.setState({ amount: event.target.value });
  };

  render() {
    let isOpen = this.props.modalOpened === this.props.modalId;
    return (
      <div>
        <Modal isOpen={isOpen} toggle={this.toggle} centered>
          <ModalHeader toggle={this.toggle}>
            Make a {this.props.tokenName} payment
          </ModalHeader>
          <ModalBody>
            <div>
              <p className="fw-600 m-0">Your are going to pay to:</p>
              {this.props.partner}
            </div>
            <div className="mt-2">
              <span className="fw-600 m-0">Token:</span> {this.props.tokenName}{" "}
              ({this.props.tokenAddress})
            </div>
            <div className="mt-2">
              <span className="fw-600">Please fill the amount:</span>
              <Input
                type="text"
                name="amount"
                id="paymentAmount"
                placeholder="Amount"
                onChange={this.handleChange}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" className="px-4" onClick={this.cancel}>
              CANCEL
            </Button>
            <Button color="primary" className="px-4" onClick={this.pay}>
              PAY!
            </Button>{" "}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modalOpened: state.channel.openedPayModal
  };
};

function mapDispatchToProps(dispatch) {
  return {
    toggle: data => dispatch(changePayModal(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PayModalComponent);
