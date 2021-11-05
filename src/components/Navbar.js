import React, { Component } from "react";
import Identicon from "identicon.js";
class Navbar extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-sm bg-light flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trade Eth
          </a>
          <ul class="navbar-nav ml-auto">
            <li class="nav-item text-nowrap d-none d-sm-none d-sm-block">
                <small id="accounts">{this.props.account}</small>
            </li>

            <li class="nav-item">
            {this.props.account?
            <img
            className="ml-2"
            width = '30'
            height='30'
            src={`data:image/png;base64,${new Identicon(this.props.account,30).toString()}`}
            alt='img'
            />:<span></span>}

            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default Navbar;
