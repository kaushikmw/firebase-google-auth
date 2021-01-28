import firebase from "firebase/app";
import "firebase/firestore";

const config = {
    apiKey: "AIzaSyCi8CGjq1axwk2pzg5B89R7k0xgDr-tSnc",
    authDomain: "react-grid-dashboard-kwr2.firebaseapp.com",
    databaseURL: "https://react-grid-dashboard-kwr2-default-rtdb.firebaseio.com",
    projectId: "react-grid-dashboard-kwr2",
    storageBucket: "react-grid-dashboard-kwr2.appspot.com",
    messagingSenderId: "657283336543",
    appId: "1:657283336543:web:c702d78e9ade9f78ea8eea"    
};

firebase.initializeApp(config);

export default firebase;

export const firestore = firebase.firestore();