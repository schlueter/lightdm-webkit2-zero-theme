/* global lightdm */

// For local development
if (!('lightdm' in window)) {
    window.lightdm = {
        authenticate: () => {
            window.show_prompt('username:');
        },
        is_authenticated: false,
        respond: () => {},
        sessions: [
            {key: "xmonad",        name: "XMonad"},
            {key: "enlightenment", name: "Enlightenment"},
            {key: "sway",          name: "Sway"}
        ],
        start_session_sync: (session) => {
            window.show_message(`starting ${session}`);
        }
    };
}

/* Functions for the greeter
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
    let messages = document.getElementById("messages");
    messages.style.visibility = "visible";
    text = `<p class="message-${type}">${text}</p>`;
    messages.innerHTML = `${messages.innerHTML}${text}`;
};

window.authentication_complete = () => {
    if (lightdm.is_authenticated) {
        let session = localStorage.getItem('session');
        session = 'xmonad';
        document.documentElement.addEventListener(
            'transitionend',
            () => {lightdm.start_session_sync(session)}
        );
        document.documentElement.className = 'session_starting';
    } else {
        window.show_message("Authentication Failed", "error");
        setTimeout(window.start_authentication, 3000);
    }
};

/* Theme Functions */
window.clear_messages = () => {
    let messages = document.getElementById("messages");
    messages.innerHTML = "";
    messages.style.visibility = "hidden";
}

window.start_authentication = () => {
    window.clear_messages();
    lightdm.authenticate();
};

window.handle_input = () => {
    let entry = document.getElementById("entry");
    lightdm.respond(entry.value);
};

window.populate_session_select = () => {
    let active_session = localStorage.getItem('session') || lightdm.default_session,
        input_wrapper = document.getElementById("inputWrapper"),
        session_select_element = document.createElement("select");
    session_select_element.name = "sessions";
    session_select_element.id = "session-select";

    lightdm.sessions.forEach((session) => {
        let option = document.createElement("option");

        option.value = session.key;
        option.selected = session.name === active_session;
        option.text = session.name;

        session_select_element.appendChild(option);
    });
    session_select_element.addEventListener(
        'input',
        (updateValue) => {localStorage.setItem('session', updateValue)}
    );
    input_wrapper.appendChild(session_select_element);
}

document.getElementById("entry").focus();
window.populate_session_select();
window.start_authentication();
