import React from 'react';

import './App.css';

import { isconnected,connectwallet,connectcontract,converttime } from './contractinterface/contractinterface';
import Sidebar from "./Components/Sidebar/Sidebar.js";
import Window from "./Components/Window/Window.js";

class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      connected: true, //false
      grps: ["koroks"], //[]
      msgs: [{sender: "a", time: "0:00:00 1/1/1", msg: "yahaha"},{sender: "a", time: "0:00:00 1/1/1", msg: "haha"}], //[]
      currentgrp: "koroks", //null
      cntr: null
    };
    this.changegrp = this.changegrp.bind(this);
    this.addgrp = this.addgrp.bind(this);
    this.posttogrp = this.posttogrp.bind(this);
  }

  changegrp (grpname) {
    const newmsgs = []//this.state.cntr.feed(grpname);
    this.setState((state, props) => {
      return {
        currentgrp: grpname,
        connected: state.connected,
        grps: state.grps,
        msgs: newmsgs,
        cntr: state.cntr
      }
    });
  }

  addgrp (newgrp) {
    if (!newgrp) {
      alert("Enter a group name!");
      return null
    }
    if (this.state.grps.find((grp) => {return (grp === newgrp)})) {
      alert("Group already joined!");
      return null;
    }
    let grps = this.state.grps;
    grps.push(newgrp);
    this.setState((state,props) => {
      return {
        currentgrp: state.currentgrp,
        connected: state.connected,
        grps: grps,
        msgs: state.msgs,
        cntr: state.cntr
      }
    });
  }

  posttogrp (grp,msg) {
    this.state.cntr.post(grp,msg);
  }

  logout () {
    this.setState({
      connected: true, //false
      grps: ["koroks"], //[]
      msgs: [{sender: "a", time: "0:00:00 1/1/1", msg: "yahaha"},{sender: "a", time: "0:00:00 1/1/1", msg: "haha"}], //[]
      currentgrp: "Koroks", //null
      cntr: null
    })
  }

  render () {
    if (this.state.connected) {
      return (
        <div className='gridbox'>
          <Sidebar changegrp={this.changegrp} grps={this.state.grps} addgrp={this.addgrp} />
          <Window msgs={this.state.msgs} currentgrp={this.state.currentgrp} post={this.posttogrp} logout={this.logout} />
        </div>
      );
    } else {
      return (
        <input type="button" value="Connect to Metamask" onClick={
          async () => {
            let successful = await connectwallet();
            let account = await isconnected();
            if (successful) {
              const cntr = await connectcontract();
              grps = cntr.getgrplist().map((grp) => {grp.name});
              this.setState({connected: true, cntr: cntr, grps: grps, currentgrp: null, msgs: []});
            };
          }
        }/>
      );
    }
  }


  componentDidMount() {
    this.chatreader = setInterval(
      () => {
        this.setState((state, props) => {
          const newmsgs = []//this.state.cntr.feed(this.state.currentgrp);
          return {
            currentgrp: state.currentgrp,
            connected: state.connected,
            grps: state.grps,
            msgs: newmsgs,
            cntr: state.cntr
          }
        });
      },
      200
    );
  }

  componentWillUnmount() {
    clearInterval(this.chatreader);
  }
}

export default App;
