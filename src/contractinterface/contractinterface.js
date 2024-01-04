import { ethers } from "ethers";
//import Web3Modal from "web3modal";

import { cntrabi,cntraddr } from "./constants";

export const isconnected = async () => {
    try {
        if (!window.ethereum) {
            console.log("Metamask needed!");
            return null;
        }
        const accs = await window.ethereum.request({method:"eth_accounts"}); 
        return accs[0];
    } catch (error) {
        console.log(error);
    }
};

export const connectwallet = async () => {
    try {
        if (!window.ethereum) {
            console.log("Metamask needed!");
            return null;
        }
        const accs = await window.ethereum.request({method:"eth_requestAccounts"}); 
        return accs[0];
    } catch (error) {
        console.log(error);
    }
};

const fetchcntr = (signerprovider) => {
    return new ethers.Contract(cntraddr,cntrabi,signerprovider);
};

export const connectcontract = async () => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const cntr = fetchcntr(signer);
        return cntr;
    } catch (error) {
        console.log(error);
    }
};

export const converttime = (time) => {
    const t = new Date(Number(time)*1000);
    return (t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds() + ' ' + t.getDate() + '/' + (t.getMonth() + 1) + '/' + t.getFullYear());
}