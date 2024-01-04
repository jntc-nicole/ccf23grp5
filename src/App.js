// to-do: let user set up account if they don't have one or they won't be able to do anything
import React from 'react';

import './App.css';

import { isconnected,connectwallet,connectcontract,converttime } from './contractinterface/contractinterface';
import Sidebar from "./Components/Sidebar/Sidebar.js";
import Window from "./Components/Window/Window.js";

class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      connected: false,
      grps: ["koroks"], //[]
      msgs: [{sender: "a", time: "0:00:00 1/1/1", msg: "yahaha"},{sender: "a", time: "0:00:00 1/1/1", msg: "haha"}], //[]
      currentgrp: "koroks", //null
      cntr: null,
      exists: null
    };
    this.changegrp = this.changegrp.bind(this);
    this.addgrp = this.addgrp.bind(this);
    this.posttogrp = this.posttogrp.bind(this);
    this.connect = this.connect.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getname = this.getname.bind(this);
    this.joinrandgrp = this.joinrandgrp.bind(this);
  }

  async changegrp (grpname) {
    try {
      const newmsglist = await this.state.cntr.feed(grpname);
      let newmsgs = [];
      for (let i of newmsglist) {
        let msgsender = await this.state.cntr.getname(i.sender);
        let msgtime = converttime(i.timestamp);
        newmsgs.push({sender: msgsender, time: msgtime, msg: i.txt});
      }
      this.setState((state, props) => {
        return {
          currentgrp: grpname,
          connected: state.connected,
          grps: state.grps,
          msgs: newmsgs,
          cntr: state.cntr,
          exists: state.exists,
          name: state.name
        }
      })
    } catch (error) {
      alert("An error occurred! Check the console for details."); 
      console.log(error);
    }
  }

  async addgrp (newgrp) {
    try {
      if (!newgrp) {
        alert("Enter a group name!");
        return null
      }
      if (this.state.grps.find((grp) => {return (grp === newgrp)})) {
        alert("Group already joined!");
        return null;
      }
      const tx = await this.state.cntr.addgrp(newgrp);
      await tx.wait();
      let grps = this.state.grps;
      grps.push(newgrp);
      this.setState({
        currentgrp: this.state.currentgrp,
        connected: this.state.connected,
        grps: grps,
        msgs: this.state.msgs,
        cntr: this.state.cntr,
        exists: this.state.exists,
        name: this.state.name
      });
    } catch (error) {
      alert("An error occurred! Check the console for details.");
      console.log(error);
    }
  }

  async joinrandgrp () {
    let mygrps = await this.state.cntr.getgrplist();
    const allgrps = await this.state.cntr.getallgrp();
    if (mygrps.length >= allgrps.length) {
      alert("You are too lucky to be so well connected!");
      return null;
    }
    let notmygrps = [];
    let mygrpnames = [];
    for (let i of mygrps) {
      mygrpnames.push(i.name);
    }
    for (let i of allgrps) {
      if (!mygrpnames.includes(i.name)) {
        notmygrps.push(i.name);
      }
    }
    this.addgrp(notmygrps[Math.floor((Math.random()*notmygrps.length))]);
  }

  async posttogrp (grp,msg) {
    try {
      const tx = await this.state.cntr.post(grp,msg);
      await tx.wait();
    } catch (error) {
      alert("An error occurred! Check the console for details.");
      console.log(error);
    }
  }

  async login (name) {
    try {
      const doiexist = await this.state.cntr.doiexist();
      if (!doiexist) {
        const tx = await this.state.cntr.mkacc(name);
        await tx.wait();
        this.login(name);
      }
      const myname = await this.state.cntr.myname();
      this.setState((state,props) => {
        return {
          currentgrp: state.currentgrp,
          connected: state.connected,
          grps: [],
          msgs: state.msgs,
          cntr: state.cntr,
          exists: doiexist,
          name: myname
        };
      });
    } catch (error) {
      alert("An error occurred! Check the console for details.");
      console.log(error);
    }
  }

  async connect () {
    try {
      let successful = await connectwallet();
      let account = await isconnected();
      const cntr = await connectcontract();
      const doiexist = await cntr.doiexist();
      this.setState({connected: true, cntr: cntr, grps: [], currentgrp: null, msgs: [], exists: doiexist, name: ""});
      if (doiexist) {
        const grps = await cntr.getgrplist();
        let grpnames = []
        for (let i of grps) {
          grpnames.push(i[1]);
        }
        const myname = await this.state.cntr.myname();
        this.setState((state,props) => {
          return {
            currentgrp: state.currentgrp,
            connected: true,
            grps: grpnames,
            msgs: state.msgs,
            cntr: cntr,
            exists: doiexist,
            name: myname
          };
        });
      }
    } catch (error) {
      alert("An error occurred! Check the console for details.");
      console.log(error);
    }
  }

  logout () {
    /*this.setState({
      connected: false,
      grps: [],
      msgs: [],
      currentgrp: "Koroks",
      cntr: null,
      exists: false
    })*/
    window.location.reload();
  }

  async getname (addr) {
    return this.state.cntr.getname(addr);
  }

  render () {
    if (this.state.connected) {
      if (this.state.exists) {
        return (
          <div className='gridbox'>
            <Sidebar changegrp={this.changegrp} myusername={this.state.name} grps={this.state.grps} addgrp={this.addgrp} lucky={this.joinrandgrp} />
            <div className='vertline'></div>
            <Window msgs={this.state.msgs} currentgrp={this.state.currentgrp} post={this.posttogrp} logout={this.logout} getname={this.getname} />
          </div>
        );
        } else {
          return (
            <div>
              <h1>Make an account:</h1>
              <p>Username: </p>
              <input type="text" id="myusername" />
              <input type="button" value="Register" onClick={() => {const myusername = document.getElementById("myusername").value;this.login(myusername);}} />
            </div>
          );
        }
    } else {
      return (
        <input type="button" value="Click to Connect to Metamask" onClick={this.connect} style={{height: "100%",width: "100%",fontSize: "3em"}} />
      );
    }
  }


  componentDidMount() {
    this.chatreader = setInterval(
      async () => {
        if (this.state.connected) {
          if (this.state.currentgrp) {
            const newmsglist = await this.state.cntr.feed(this.state.currentgrp);
            let newmsgs = [];
            for (let i of newmsglist) {
              let msgsender = await this.state.cntr.getname(i.sender);
              let msgtime = converttime(i.timestamp);
              newmsgs.push({sender: msgsender, time: msgtime, msg: i.txt});
            }
            this.setState((state, props) => {
              return {
                currentgrp: state.currentgrp,
                connected: state.connected,
                grps: state.grps,
                msgs: newmsgs,
                cntr: state.cntr,
                exists: state.exists,
                name: state.name
              }
            });
          }
        };
      },
      200
    );
  }

  componentWillUnmount() {
    clearInterval(this.chatreader);
  }
}

export default App;
