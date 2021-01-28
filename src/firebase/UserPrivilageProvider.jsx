import React, {  } from "react";
import firebase from "firebase/app";
import { useState,useContext } from "react";
import { useEffect } from "react";
import { firestore } from "./config";
import { useSession } from "./UserProvider";

export const UserPrivilageContext = React.createContext();

export const UserPrivilageProvider = (props) => {

    const [privilages, setPrivilages] = useState({canAccessDMS: false,
                                                canAccessFMS: false,
                                                canCreateDMS: false,
                                                canReadDMS: false,
                                                canUpdateDMS: false,
                                                isAdmin: false,
                                                 language: 'English',
                                                loading: false});
    const {user} = useSession();
    
    useEffect(() => {
        if(user){
            const docRef = firestore.collection(`users`).doc(user.uid)
            .onSnapshot((doc) => {
                console.log('logged in user');
                console.log(doc.data());
                let userData = doc.data();
                setPrivilages({
                    canAccessDMS: userData.dms.canAccess,
                    canAcceptDonation: userData.dms.canAcceptDonation,
                    canUpdateDonor: userData.dms.canUpdateDonor,
                    canCreateDonor: userData.dms.canCreateDonor,
                    canAccessFMS: userData.canAccessFMS,
                    isAdmin: userData.isAdmin,
                    language: userData.language,
                })
            });
        }
    }, [user]);

    return(
        <UserPrivilageContext.Provider value={privilages}>
            {!privilages.loading && props.children}
        </UserPrivilageContext.Provider>
    );
}

export const resetUserPrivilages = () => {

}
export const GetUserPrivilages = () => {
    return  useContext(UserPrivilageContext);
}