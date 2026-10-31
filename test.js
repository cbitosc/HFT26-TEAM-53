function login_user(username, password) {
    console.log("Authenticating user");
    return true;
}

function logout_user() {
    console.log("User logged out");
} 
class UserAuthentication {
    login(username, password) {
        return true;
    }

    logout() {
        console.log("Logged out");
    }
}