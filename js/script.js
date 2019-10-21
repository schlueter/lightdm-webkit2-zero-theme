/* global lightdm */

/*
 * Functions for the greeter
 * These are documented in the lightdm-webkit2-greeter(1) man page
 */
window.show_prompt = (text, type) => {
    // type is either "text" or "password"
    let entry = document.getElementById("entry");
    entry.placeholder = text.charAt(0).toUpperCase() +
        text.slice(1).replace(":", "");

    // clear entry
    entry.value = "";
    entry.type = type;
};

window.show_message = (text, type) => {
    let messages = document.getElementById('messages');
    messages.style.visibility = "visible";
    // type is either "info" or "error"
    if (type == 'error') {
        text = `<p style="color:red;">${text}</p>`;
    }
    messages.innerHTML = `${messages.innerHTML}${text}`;
};

window.authentication_complete = () => {
    if (lightdm.is_authenticated) {
        document.documentElement.addEventListener(
            'transitionend',
            () => {lightdm.start_session_sync('xmonad')}
        );
        document.documentElement.className = 'session_starting';
    } else {
        window.show_message("Authentication Failed", "error");
        setTimeout(window.start_authentication, 3000);
    }
};

/*
 * Theme Functions
 */
window.clear_messages = () => {
    let messages = document.getElementById("messages");
    messages.innerHTML = "";
    messages.style.visibility = "hidden";
}

window.start_authentication = () => {
    window.clear_messages();
    lightdm.authenticate();
    window.show_message("Hello");
    window.display_session_choices();
};

window.handle_input = () => {
    let entry = document.getElementById("entry");
    lightdm.respond(entry.value);
};

window.display_session_choices = () => {
    window.show_message(lightdm.sessions);
}
