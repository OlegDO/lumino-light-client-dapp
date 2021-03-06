import React from "react";
import "./App.css";
import { connect } from "react-redux";
import copyToClipboard from "copy-to-clipboard";
import ChannelListItemComponent from "./components/ChannelListItemComponent";
import { Button } from "reactstrap";
import { Lumino } from "@rsksmart/lumino-light-client-sdk";
import { makeStartup, changeOpenChannelStatus } from "./actions/global";
import { channelsLoaded } from "./actions/channel";
import OpenChannelModalComponent from "./components/OpenChannelModalComponent";
import SendTokensModal from "./components/SendTokensModal";
import {
  address,
  chainId,
  hubEndpoint,
  notifierEndpoints,
  PrivateKey,
  registryAddress,
  rskEndpoint,
  tokenNetworkAddresses
} from "./constants/app";

import rLogin from "./auth/auth";

class App extends React.Component {
  state = {
    showSendTokens: false,
    onboarded: false
  };

  componentDidMount = async () => {
    // this.handleLogin();
    this.props.makeStartup();
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleLogin = () => {
    rLogin
      .connect()
      .then(rLoginResponse => {
        const provider = rLoginResponse.provider;
        const dataVault = rLoginResponse.dataVault;
        const disconnect = rLoginResponse.disconnect;
        console.log("rLoginResponse: ", rLoginResponse);
        console.log(" provider: ", provider);
        console.log("dataVault: ", dataVault);
        console.log("disconnect: ", disconnect);
      })
      .catch(err => console.log(err));
  };

  onboarding = async () => {
    const lumino = Lumino.get();

    await lumino.actions.onboardingClient();

    for (let notifierEndpoint of notifierEndpoints) {
      await lumino.actions.notifierRegistration(notifierEndpoint);
      await lumino.actions.subscribeToOpenChannel(notifierEndpoint);
    }

    for (let networkAddress of tokenNetworkAddresses) {
      for (let notifierEndpoint of notifierEndpoints) {
        await lumino.actions.subscribeToUserClosesChannelOnToken(
          notifierEndpoint,
          networkAddress
        );
      }
    }
    this.setState({
      onboarded: true
    });
  };

  openChannel = async () => {
    this.props.openChannelModal(true);
  };

  refreshChannels = async () => {
    const channels = await Lumino.get().actions.getChannels();
    this.props.loadChannels(channels);
  };

  toggleShowSendTokens = () => {
    const { showSendTokens } = this.state;
    return this.setState({ showSendTokens: !showSendTokens });
  };

  getButtons() {
    let showButtons = false;
    if (this.props.initialized) {
      const apiKey = Lumino.get().actions.getApiKey();
      showButtons = !!apiKey;
    }
    return showButtons
      ? [
          <li key="open-channel" className="mx-2">
            <Button onClick={this.openChannel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                data-icon="chart-network"
                data-prefix="fal"
                viewBox="0 0 640 512"
                width={20}
              >
                <path
                  fill="#ffffff"
                  d="M513.6 202.8l-19.2-25.6-48 36 19.2 25.6 48-36zM576 192c13.3 0 25.6-4 35.8-10.9 6.8-4.6 12.7-10.5 17.3-17.3C636 153.6 640 141.3 640 128c0-13.3-4-25.6-10.9-35.8-2.3-3.4-4.9-6.6-7.8-9.5-2.9-2.9-6.1-5.5-9.5-7.8C601.6 68 589.3 64 576 64s-25.6 4-35.8 10.9c-6.8 4.6-12.7 10.5-17.3 17.3C516 102.4 512 114.7 512 128c0 35.3 28.7 64 64 64zm0-96c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zM99.8 250.9C89.6 244 77.3 240 64 240s-25.6 4-35.8 10.9c-6.8 4.6-12.7 10.5-17.3 17.3C4 278.4 0 290.7 0 304c0 35.3 28.7 64 64 64s64-28.7 64-64c0-13.3-4-25.6-10.9-35.8-4.6-6.8-10.5-12.7-17.3-17.3zM64 336c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm88-16h48v-32h-48v32zm469.3 82.7c-2.9-2.9-6.1-5.5-9.5-7.8C601.6 388 589.3 384 576 384s-25.6 4-35.8 10.9c-3.3 2.2-6.3 4.7-9.1 7.5l-91.8-55.1c5.6-13.3 8.7-28 8.7-43.3 0-61.9-50.1-112-112-112-11.3 0-21.9 2.2-32.2 5.2l-39.3-84.1C278.8 101.4 288 83.9 288 64c0-13.3-4-25.6-10.9-35.8-4.6-6.8-10.5-12.7-17.3-17.3C249.6 4 237.3 0 224 0s-25.6 4-35.8 10.9c-6.8 4.6-12.7 10.5-17.3 17.3C164 38.4 160 50.7 160 64c0 35.3 28.7 64 64 64 4 0 7.9-.5 11.7-1.2l39 83.6c-30.5 20-50.7 54.4-50.7 93.6 0 61.9 50.1 112 112 112 35 0 65.8-16.4 86.4-41.5l92.4 55.4c-1.7 5.8-2.7 11.8-2.7 18.1 0 35.3 28.7 64 64 64 13.3 0 25.6-4 35.8-10.9 6.8-4.6 12.7-10.5 17.3-17.3C636 473.6 640 461.3 640 448c0-13.3-4-25.6-10.9-35.8-2.3-3.4-5-6.6-7.8-9.5zM224 96c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm112 288c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80zm240 96c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z"
                />
              </svg>
              Open Channel
            </Button>
          </li>,
          <li key="refresh-channels" className="mx-2">
            <Button onClick={this.refreshChannels}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                data-icon="sync"
                data-prefix="fal"
                viewBox="0 0 512 512"
                width={15}
              >
                <path
                  fill="#ffffff"
                  d="M492 8h-10c-6.627 0-12 5.373-12 12v110.627C426.929 57.261 347.224 8 256 8 123.228 8 14.824 112.338 8.31 243.493 7.971 250.311 13.475 256 20.301 256h10.016c6.353 0 11.646-4.949 11.977-11.293C48.157 132.216 141.097 42 256 42c82.862 0 154.737 47.077 190.289 116H332c-6.627 0-12 5.373-12 12v10c0 6.627 5.373 12 12 12h160c6.627 0 12-5.373 12-12V20c0-6.627-5.373-12-12-12zm-.301 248h-10.015c-6.352 0-11.647 4.949-11.977 11.293C463.841 380.158 370.546 470 256 470c-82.608 0-154.672-46.952-190.299-116H180c6.627 0 12-5.373 12-12v-10c0-6.627-5.373-12-12-12H20c-6.627 0-12 5.373-12 12v160c0 6.627 5.373 12 12 12h10c6.627 0 12-5.373 12-12V381.373C85.071 454.739 164.777 504 256 504c132.773 0 241.176-104.338 247.69-235.493.339-6.818-5.165-12.507-11.991-12.507z"
                />
              </svg>
              Refresh Channels
            </Button>
          </li>,
          <li key="send-tokens" className="mx-2">
            <Button onClick={this.toggleShowSendTokens}>
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="far"
                data-icon="paper-plane"
                className="svg-inline--fa fa-paper-plane fa-w-16"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width={15}
              >
                <path
                  fill="currentColor"
                  d="M440 6.5L24 246.4c-34.4 19.9-31.1 70.8 5.7 85.9L144 379.6V464c0 46.4 59.2 65.5 86.6 28.6l43.8-59.1 111.9 46.2c5.9 2.4 12.1 3.6 18.3 3.6 8.2 0 16.3-2.1 23.6-6.2 12.8-7.2 21.6-20 23.9-34.5l59.4-387.2c6.1-40.1-36.9-68.8-71.5-48.9zM192 464v-64.6l36.6 15.1L192 464zm212.6-28.7l-153.8-63.5L391 169.5c10.7-15.5-9.5-33.5-23.7-21.2L155.8 332.6 48 288 464 48l-59.4 387.3z"
                ></path>
              </svg>
              Send Tokens
            </Button>
          </li>
        ]
      : [
          <li key="onboarding" className="mx-2">
            <Button onClick={this.onboarding}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                data-icon="plus"
                data-prefix="fal"
                viewBox="0 0 384 512"
                width={15}
              >
                <path
                  fill="#ffffff"
                  d="M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                />
              </svg>
              Onboarding
            </Button>
          </li>
        ];
  }

  copyAddressToClipboard() {
    copyToClipboard(address);
  }

  getInfo() {
    let notifierItems = null;
    if (notifierEndpoints.length > 0) {
      notifierItems = (
        <li key="notifier-endpoints">
          Notifier Endpoints:&nbsp;
          {notifierEndpoints.map((notifierEndpoint, index) => {
            if (index < notifierEndpoints.length - 1) {
              return (
                <span key={`notifier-endpoint-${index}`}>
                  <a
                    key={`notifier-endpoint-link-${index}`}
                    href={notifierEndpoint}
                  >
                    {notifierEndpoint}
                  </a>
                  ,&nbsp;
                </span>
              );
            }
            return (
              <span key={`notifier-endpoint-${index}`}>
                <a
                  key={`notifier-endpoint-link-${index}`}
                  href={notifierEndpoint}
                >
                  {notifierEndpoint}
                </a>
              </span>
            );
          })}
        </li>
      );
    }
    return (
      <div className="network-info">
        <ul className="list-unstyled">
          <li key="address">
            Address: {address}
            <svg
              onClick={this.copyAddressToClipboard}
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="copy"
              className="svg-inline--fa fa-copy fa-w-14"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width={15}
            >
              <path
                fill="currentColor"
                d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"
              ></path>
            </svg>
          </li>
          <li key="private-key">PKey: {PrivateKey}</li>
          <li key="chain-id">Chain Id: {chainId}</li>
          <li key="rsk-endpoint">
            RSK Endpoint: <a href={rskEndpoint}>{rskEndpoint}</a>
          </li>
          <li key="hub-endpoint">
            Hub Endpoint: <a href={hubEndpoint}>{hubEndpoint}</a>
          </li>
          <li key="registry-contract-address">
            Registry Contract Address: {registryAddress}
          </li>
          <li key="token-network-address">
            Token Network Addresses: {tokenNetworkAddresses.join(", ")}
          </li>
          {notifierItems}
        </ul>
      </div>
    );
  }

  render = () => {
    const { showSendTokens } = this.state;
    const buttons = this.getButtons();
    const info = this.getInfo();
    return (
      <div className="App d-flex h-100 flex-column">
        <div className="bg-page" />
        <header className="p-3 position-relative z-2 d-flex align-items-center flex-column flex-lg-row">
          <svg width="100" height="46" viewBox="0 0 100 46">
            <g fill="#fff" fillRule="nonzero" stroke="none" strokeWidth="1">
              <path
                d="M10.845 15.797h10.268a.124.124 0 00.115-.116v-3.32a.124.124 0 00-.115-.115H10.845a.124.124 0 00-.116.115v3.32c0 .077.058.116.116.116zm6.948-6.085h3.32a.124.124 0 00.115-.115v-3.32a.124.124 0 00-.115-.116h-3.32a.124.124 0 00-.115.115v3.32c0 .059.057.116.115.116zM3.589 24.434H.27a.124.124 0 00-.115.115v3.32c0 .058.057.116.115.116h3.32a.124.124 0 00.115-.116v-3.32a.124.124 0 00-.115-.115zm12.188 0h-3.32a.124.124 0 00-.115.115v10.269c0 .057.057.115.115.115h3.32a.124.124 0 00.116-.115v-10.27a.124.124 0 00-.116-.114zm20.307-3.32h3.321a.124.124 0 00.115-.116v-3.32a.124.124 0 00-.115-.116h-3.32a.124.124 0 00-.116.116v3.32c0 .077.039.115.115.115zm-6.103 0h3.32a.124.124 0 00.116-.116V10.73a.124.124 0 00-.116-.115h-3.32a.124.124 0 00-.115.115V21c0 .076.057.114.115.114zM17.793 3.607h3.32a.124.124 0 00.115-.115V.173a.124.124 0 00-.115-.115h-3.32a.124.124 0 00-.115.115v3.32c0 .077.057.115.115.115zm-8.1 20.826h-3.32a.124.124 0 00-.116.115v3.32c0 .058.058.116.115.116h3.32a.124.124 0 00.116-.116v-3.32c-.02-.058-.058-.115-.115-.115zm25.24 5.336H24.664a.124.124 0 00-.115.115v3.32c0 .058.058.116.115.116h10.269a.124.124 0 00.115-.116v-3.32c-.02-.077-.058-.115-.115-.115zm7.006-6.046h-14.55a.124.124 0 00-.115.115v3.224c0 .058.058.116.116.116h14.549a.124.124 0 00.115-.116V23.84c0-.077-.058-.115-.115-.115zm-13.974 12.13h-3.32a.124.124 0 00-.115.115v3.32c0 .058.057.116.115.116h3.32a.124.124 0 00.116-.115v-3.32c0-.058-.039-.116-.116-.116zm-9.481-17.351a.124.124 0 00-.115-.115H3.819a.124.124 0 00-.115.115v3.224c0 .058.058.116.116.116h14.549a.124.124 0 00.115-.116v-3.224zm27.005-.921h-3.32a.124.124 0 00-.115.115v3.32c0 .058.057.115.115.115h3.32a.124.124 0 00.116-.115v-3.32c0-.077-.039-.115-.116-.115zm-23.666 9.597H18.6a.124.124 0 00-.115.115v14.549c0 .057.057.115.115.115h3.224a.124.124 0 00.116-.115v-14.55a.124.124 0 00-.116-.114zm5.451-8.887V3.724a.124.124 0 00-.115-.116h-3.224a.124.124 0 00-.115.116v14.568c0 .057.057.115.115.115h3.224a.124.124 0 00.115-.115zm.691 23.666h-3.32a.124.124 0 00-.115.115v3.32c0 .058.057.116.115.116h3.32a.124.124 0 00.116-.116v-3.32c0-.077-.039-.115-.116-.115zM66.583 17.562h-5.105c-5.509 0-8.676 3.916-8.676 9.367l-.038 18.292c0 .153.134.288.288.288h6.372a.295.295 0 00.288-.288l-.211-18.1c0-2.246 1.248-3.474 3.532-3.474h3.55a.295.295 0 00.288-.288V17.85a.295.295 0 00-.288-.288zm12.592.173h-6.373a.295.295 0 00-.288.288v27.198c0 .153.135.288.288.288h6.373a.295.295 0 00.288-.288V18.004c0-.154-.116-.269-.288-.269zm.172-11.708H72.63a.124.124 0 00-.116.115v6.718c0 .057.058.115.116.115h6.717a.124.124 0 00.116-.115V6.142c0-.077-.039-.115-.116-.115zm20.615 12.36a.295.295 0 00-.288-.287h-7.102v-2.783c0-2.246 1.248-3.474 3.532-3.474h3.512a.295.295 0 00.288-.288V6.046a.295.295 0 00-.288-.288H94.55c-5.509 0-8.676 3.916-8.676 9.367l-.038 30.096c0 .153.134.288.288.288h6.372a.295.295 0 00.288-.288V24.069h6.89a.295.295 0 00.289-.288v-5.393z"
                transform="translate(-15 -22) translate(15 22)"
              />
            </g>
          </svg>
          <ul className="list-unstyled text-center buttons-list ml-lg-auto d-flex mb-0 mt-3 mt-lg-0">
            {buttons}
          </ul>
        </header>
        <li>{info}</li>
        <ul className="list-unstyled p-3 channel-list z-2 mt-auto">
          {Object.values(this.props.channels).map((channel, index) => {
            return (
              <ChannelListItemComponent
                key={index}
                tokenName={channel.token_name || "???"}
                tokenSymbol={channel.token_symbol || "???"}
                partner={channel.partner_address}
                balance={channel.offChainBalance}
                status={channel.sdk_status}
                tokenAddress={channel.token_address}
                tokenNetworkAddress={channel.token_network_identifier}
                channelId={channel.channel_identifier}
              />
            );
          })}
        </ul>
        <SendTokensModal
          toggleModal={this.toggleShowSendTokens}
          open={showSendTokens}
        />
        <OpenChannelModalComponent />
      </div>
    );
  };
}

const mapStateToProps = state => {
  return {
    channels: state.channel.list,
    initialized: state.global.initialized
  };
};

function mapDispatchToProps(dispatch) {
  return {
    makeStartup: () => {
      dispatch(makeStartup());
    },
    loadChannels: channels => dispatch(channelsLoaded(channels)),
    openChannelModal: status => dispatch(changeOpenChannelStatus(status))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
