import{
    GoogleAuthProvider,
    signInWithPopup,
    UserCredential,
    signOut,
} from 'firebase/auth';
import {auth} from "@/lib/firebase/config";

export const login = async(): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth,provider);
};

export const logout = async(): Promise<void> => {
    return signOut(auth);
};