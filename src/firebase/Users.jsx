import { firestore } from "./config"

export const createUserDocument = async (user) => {

    const docRef = firestore.collection('users').doc(user.uid);
    const doc = await docRef.get();

    //Create user object
    const userProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        language: 'English',
        isAdmin : false,
        canAccessDMS: false,
        canAccessFMS: false,
        photoURL: user.photoURL,
    };

    if(!doc.exists){      
        //write to cloud firesore
        return docRef.set(userProfile);
    }else{
        //Update the existing user profile
        return docRef.update({uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,});
    }

    
}