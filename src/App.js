import React from 'react';

import './App.css';

// functions: checks if the wallet is connected, connects to the wallet, connects to the contract, converts timestamp to date string
import { isconnected,connectwallet,connectcontract,converttime } from './contractinterface/contractinterface';
// Sidebar: for group management
import Sidebar from "./Components/Sidebar/Sidebar.js";
// Window: for interacting with selected group
import Window from "./Components/Window/Window.js";

// note: if there is an error, we alert the user and log the error to the console
class App extends React.Component {

  // initializes dummy state, only important variable at this moment is connected = false, which ensures initial state is accountless
  // binds the class to the this function of each 
  constructor (props) {
    super(props);
    this.state = {
      connected: false,
      grps: ["koroks"], //[]
      msgs: [{sender: "a", time: "0:00:00 1/1/1", msg: "yahaha"},{sender: "a", time: "0:00:00 1/1/1", msg: "haha"}], //[]
      currentgrp: "koroks", //null
      cntr: null,
      exists: null,
      name: ""
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

  // switches selected group to a new input group name (grpname) #passed to Sidebar for individual group selector buttons
  async changegrp (grpname) {
    try {
      // requests the messages of the new group
      const newmsglist = await this.state.cntr.feed(grpname);
      // for storing processed messages
      let newmsgs = [];
      // converts each address to a name and each timestamp to a datetime
      for (let i of newmsglist) {
        let msgsender = await this.state.cntr.getname(i.sender);
        let msgtime = converttime(i.timestamp);
        newmsgs.push({sender: msgsender, time: msgtime, msg: i.txt});
      }
      // updates current selected group (currentgrp) and the current group's messages (msgs) in the state
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

  // takes an input group name (newgrp) and adds the user to it, creating the group if the group didn't exist yet #passed to Sidebar for joining groups
  async addgrp (newgrp) {
    try {
      // alerts the user and exits if the input is invalid (empty or already joined)
      if (!newgrp) {
        alert("Enter a group name!");
        return null
      }
      if (this.state.grps.find((grp) => {return (grp === newgrp)})) {
        alert("Group already joined!");
        return null;
      }
      // adds the group to the users groups on the ledger
      const tx = await this.state.cntr.addgrp(newgrp);
      await tx.wait();
      // adds the group to current groups in order to sync with ledger
      let grps = this.state.grps;
      grps.push(newgrp);
      // updates the user's groups (grps) in the state
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

  // joins a random group which the user is not in #passed to Sidebar for joining a random group
  async joinrandgrp () {
    // gets the groups of the user
    let mygrps = await this.state.cntr.getgrplist();
    // gets all existing groups
    const allgrps = await this.state.cntr.getallgrp();
    // if the 2 lists of groups are the same length, the user already joined all groups and cannot join another; they are congratulated and the fucntion exits
    if (mygrps.length >= allgrps.length) {
      alert("You are too lucky to be so well connected!");
      return null;
    }
    // for storing groups the user isn't in
    let notmygrps = [];
    // for storing the extracted names of the user's groups
    let mygrpnames = [];
    // extracts the names of the user's groups
    for (let i of mygrps) {
      mygrpnames.push(i.name);
    }
    // adds groups the user isn't a part of to array notmygrps
    for (let i of allgrps) {
      if (!mygrpnames.includes(i.name)) {
        notmygrps.push(i.name);
      }
    }
    // selects a random element of notmygrps and joins it
    this.addgrp(notmygrps[Math.floor((Math.random()*notmygrps.length))]);
  }

  // posts a message (msg) to a group (grp) #passed to Window to post messages
  async posttogrp (grp,msg) {
    try {
      // posts the message (msg) to the group (grp); updating the message feed is done regularly so it isn't done here
      const tx = await this.state.cntr.post(grp,msg);
      await tx.wait();
    } catch (error) {
      alert("An error occurred! Check the console for details.");
      console.log(error);
    }
  }

  // for logging in after registering an account
  async login (name) {
    try {
      // makes the user's account on the ledger
      const doiexist = await this.state.cntr.doiexist();
      if (!doiexist) {
        const tx = await this.state.cntr.mkacc(name);
        await tx.wait();
        this.login(name);
      }
      // gets the user's name
      const myname = await this.state.cntr.myname();
      // updates the existence status (exists) and user name (name), initializes groups to empty list in the state
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

  // connects to the wallet, smart contract, and an existing account
  async connect () {
    try {
      // connects to the Metamask wallet
      let successful = await connectwallet();
      let account = await isconnected();
      // connects to the smart contract
      const cntr = await connectcontract();
      // checks if the user has an account
      const doiexist = await cntr.doiexist();
      // initializes connected state (connected) and saves contract reference (cntr) to the state
      this.setState({connected: true, cntr: cntr, grps: [], currentgrp: null, msgs: [], exists: doiexist, name: ""});
      // if the user exists, updates state to reflect their data
      if (doiexist) {
        // gets the groups of the user and stores their names in array grpnames
        const grps = await cntr.getgrplist();
        let grpnames = []
        for (let i of grps) {
          grpnames.push(i.name);
        }
        // gets the user's name
        const myname = await this.state.cntr.myname();
        // updates the user's name (name), groups (grps), existence state (exists), connection status (connected), and saves the contract reference (cntr) in the state
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

  // logs out #passed to Window for logging out
  logout () {
    // reloading the page logs the user out as the default state is reset and not connected to the smart contract
    window.location.reload();
  }

  // returns corresponding name of an address #for processing message objects
  async getname (addr) {
    return this.state.cntr.getname(addr);
  }

  // renders the frontend
  render () {
    // are the wallet and smart contract connected?
    if (this.state.connected) {
      // connected: does the user have an account? (exists is set in the connect function)
      if (this.state.exists) {
        // user has an account: show relevant components
        return (
          <div className='gridbox'>
            <Sidebar changegrp={this.changegrp} myusername={this.state.name} grps={this.state.grps} addgrp={this.addgrp} lucky={this.joinrandgrp} />
            <div className='vertline'></div>
            <Window msgs={this.state.msgs} currentgrp={this.state.currentgrp} post={this.posttogrp} logout={this.logout} getname={this.getname} />
          </div>
        );
        } else {
          // user doesn't have an account: prompts account creation
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
      // not connected: connect to Metamask and smart contract via button
      return (
        <input type="button" value="Click to Connect to Metamask" onClick={this.connect} style={{height: "100%",width: "100%",fontSize: "3em"}} />
      );
    }
  }

  // every 200 milliseconds, update message feed
  componentDidMount() {
    this.chatreader = setInterval(
      async () => {
        // ensure connection
        if (this.state.connected) {
          // ensure a group is selected
          if (this.state.currentgrp) {
            // get the groups messages
            const newmsglist = await this.state.cntr.feed(this.state.currentgrp);
            // for storing processed message objects
            let newmsgs = [];
            // replaces sender address with sender name and timestamp with datetime
            for (let i of newmsglist) {
              let msgsender = await this.state.cntr.getname(i.sender);
              let msgtime = converttime(i.timestamp);
              newmsgs.push({sender: msgsender, time: msgtime, msg: i.txt});
            }
            // updates messages (msgs) in the state
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

  // prevent unnecessary processing
  componentWillUnmount() {
    clearInterval(this.chatreader);
  }
}

export default App;
