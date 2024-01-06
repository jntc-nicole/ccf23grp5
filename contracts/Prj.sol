

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12 <0.9.0;

contract Prj {
    // a group chat's code and name
    struct grp {
        bytes32 grpcode;
        string name;
    }

    // a user's nickname and group list
    struct user {
        string name;
        grp[] grps;
    }

    // a message's sender, timestamp, and content
    struct msgb {
        address sender;
        uint256 timestamp;
        string txt;
    }

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

    // check if the user exists
    function doiexist() public view returns (bool) {
        return bytes(users[msg.sender].name).length > 0;
    }

    // get name
    function myname() public view returns (string memory) {
        return users[msg.sender].name;        
    }

    // make account with input nickname
    function mkacc(string calldata name) external {
        //check if user exists already
        require(ifexist(msg.sender) == false,"User exists!");
        //check for valid nickname
        require(bytes(name).length > 0, "Input non empty nickname!");
        users[msg.sender].name = name;
    }

    // get username
    function getname(address pubkey) external view returns (string memory) {
        //check if user does not exist yet
        require(ifexist(msg.sender),"User does not exist!");
        return users[pubkey].name;
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
        grp memory newgrp = grp(_getgrpcode(grpname),grpname);
        users[msg.sender].grps.push(newgrp);
        if (ingrplist(newgrp,grplist) == false) {
            grplist.push(newgrp);
        }
    }

    // get group list
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
        // check if the user is in the group
        require(ifexist(msg.sender),"An account is required!");
        require(ifmember(msg.sender,grpname),"Not in group!");
        return msgs[_getgrpcode(grpname)];
    }
}