import firebase from "./config";
import 'firebase/auth';

export const signupWithGoogle = () => {
    console.log("In signupwith Google");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account',
                                hd: "bmspune.org"});
    
    return firebase.auth().signInWithPopup(provider);
    // firebase.auth().signInWithPopup(provider).then((result) => {
    //     var user = result.user;
    //     console.log("user");console.log(user.email);
    //     const userEmail = user.email;
    //     return result;
    // }).catch((error) => {
    //     console.log(error);
    // });
}