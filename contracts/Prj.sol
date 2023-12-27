

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12 <0.9.0;

contract Prj {

    // a friend's public key and nickname
    struct frd {
        address pubkey;
        string name;
    }

    // a group chat's code and name
    struct grp {
        bytes32 grpcode;
        string name;
    }

    // a user's nickname and friend list
    struct user {
        string name;
        frd[] frds;
        grp[] grps;
    }

    // a message's sender, timestamp, and content
    struct msgb {
        address sender;
        uint256 timestamp;
        string txt;
    }

    // a user's name and address
    struct userloc {
        string name;
        address accaddr;
    }

    // list of all users
    userloc[] userlocs;
    // list of groups
    grp[] grplist;
    // list of all user data
    mapping(address => user) users;
    // list of all messages
    mapping(bytes32 => msgb[]) msgs;

    // check if a user exists with input public key
    function ifexist(address pubkey) public view returns (bool) {
        return bytes(users[pubkey].name).length > 0;
    }

    // make account with input nickname
    function mkacc(string calldata name) external {
        //check if user exists already
        require(ifexist(msg.sender) == false,"User exists!");
        //check for valid nickname
        require(bytes(name).length > 0, "Input non empty nickname!");
        users[msg.sender].name = name;
        userlocs.push(userloc(name,msg.sender));
    }

    // get username
    function getname(address pubkey) external view returns (string memory) {
        //check if user does not exist yet
        require(ifexist(msg.sender),"User does not exist!");
        return users[pubkey].name;
    }

    // get list of users
    function getuserlocs() public view returns (userloc[] memory) {
        return userlocs;
    }

    // check if friend
    function iffrd(address p1,address p2) internal view returns (bool) {
        // makes "p2" have the longer friend list
        if (users[p1].frds.length > users[p2].frds.length) {
            address tmp = p1;
            p1 = p2;
            p2 = tmp;
        }
        for (uint256 i = 0;i < users[p1].frds.length;i++) {
            if (users[p1].frds[i].pubkey == p2) {
                return true;
            }
        }
        return false;
    }

    // adds the friends without check
    function _addfrd(address ego, address frdkey, string memory name) internal {
        frd memory newfrd = frd(frdkey,name);
        users[ego].frds.push(newfrd);
    }

    // checks and calls add friend
    function addfrd(address frdkey, string calldata name) external {
        // check if users exist already
        require(ifexist(msg.sender),"An account is required!");
        require(ifexist(frdkey),"User does not exist!");
        // prevent adding self and friends as friends
        require(msg.sender != frdkey,"Don't add yourself!");
        require(iffrd(msg.sender,frdkey) == false, "Already friends!");
        // add friends for both users
        _addfrd(msg.sender,frdkey,name);
        _addfrd(frdkey,msg.sender,users[msg.sender].name);
    }

    // computes group hash
    function _getgrpcode(string calldata grpname) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(string.concat("grp:",grpname)));
    }

    // checks if the user is in a grp
    function ifmember(address ego, string calldata grpname) internal view returns (bool) {
        bytes32 grpcode = _getgrpcode(grpname);
        for (uint256 i = 0;i < users[ego].grps.length;i++) {
            if (users[ego].grps[i].grpcode == grpcode) {
                return true;
            }
        }
        return false;
    }

    // checks if a group is in an list of groups
    function ingrplist(grp memory g, grp[] storage l) internal view returns (bool) {
        for (uint256 i = 0; i < l.length; i++) {
            if (g.grpcode == l[i].grpcode) {
                return true;
            }
        }
        return false;
    }

    // adds user to a group
    function _addgrp(address ego, string calldata grpname) internal {
        grp memory newgrp = grp(_getgrpcode(grpname),grpname);
        users[ego].grps.push(newgrp);
        if (ingrplist(newgrp,grplist) == false) {
            grplist.push(newgrp);
        }
    }

    // returns all groups
    function getallgrp() external view returns (grp[] memory) {
        grp[] memory g = grplist;
        return g;
    }

    // checks if user is in a group and then adds the user into the group
    function addgrp(string calldata grpname) external {
        // check if the user exists and is in not the group
        require(ifexist(msg.sender),"An account is required!");
        require(ifmember(msg.sender,grpname) == false,"Already in group!");
        _addgrp(msg.sender,grpname);
    }

    // get friend list
    function getfrdlist() external view returns (frd[] memory) {
        return users[msg.sender].frds;
    }

    // get friend list
    function getgrplist() external view returns (grp[] memory) {
        return users[msg.sender].grps;
    }

    // get combined chat code: a combined hash of the ordered addresses of the 2 users
    function _getchtcode(address p1, address p2) internal pure returns (bytes32) {
        if (p1 < p2) {
            return keccak256(abi.encodePacked(p1,p2));
        } else {
            return keccak256(abi.encodePacked(p2,p1));
        }
    }

    // send a message
    function sendmsg(address frdkey, string calldata _msg) external {
        // check for user existence and friendship status
        require(ifexist(msg.sender),"An account is required!");
        require(ifexist(frdkey),"Account does not exist!");
        require(iffrd(msg.sender,frdkey), "You are not friends...");

        // get chat code
        bytes32 chtcode = _getchtcode(msg.sender,frdkey);
        // create new message
        msgb memory newmsg = msgb(msg.sender,block.timestamp,_msg);
        // push message to chat with the corresponding chat code
        msgs[chtcode].push(newmsg);
    }

    // read private messages from a friend
    function rdmsg(address frdkey) external view returns (msgb[] memory) {
        bytes32 chtcode = _getchtcode(msg.sender,frdkey);
        return msgs[chtcode];
    }

    // post to a group
    function post(string calldata grpname, string calldata _msg) external {
        // check if the user is in the group
        require(ifexist(msg.sender),"An account is required!");
        require(ifmember(msg.sender,grpname),"Not in group!");
        // create new message
        msgb memory newmsg = msgb(msg.sender,block.timestamp,_msg);
        // push message to chat with the corresponding chat code
        msgs[_getgrpcode(grpname)].push(newmsg);
    }

    // read from feed
    function feed(string calldata grpname) external view returns (msgb[] memory) {
        return msgs[_getgrpcode(grpname)];
    }
}