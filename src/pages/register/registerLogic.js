import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";


export async function registerUser(displayName, email, password, confirmPassword) {

    if (password !== confirmPassword) {
        return "Passwords do not match";
    }
    
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password)

        try {
            await firestore().collection("members").doc(userCredential.user.uid).set({
                displayName: displayName,
                houses: {},
            });
        } catch(error) {
            
            await userCredential.user.delete();

            if (error.code === "firestore/permission-denied") {
                return "Permission Denied";
            }
            console.log(error);
            return "Unknown Firestore error";
        }

    } catch (error) {
        if (error.code === "auth/invalid-email") {
            return "Invalid Email";
        } else if (error.code === "auth/user-not-found") {
            return "Unknown Email";
        } else if (error.code === "auth/weak-password") {
            return "Password must contain at least 6 characters";
        } else if (error.code === "auth/email-already-in-use") {
            return "Email already in use";
        }
        console.log(error)
        return "Unknown authentication error";
    }
    return false;
}