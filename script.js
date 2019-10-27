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
    text = `<p class="message-${type}">${text}</p>`;
    messages.innerHTML = `${messages.innerHTML}${text}`;
};

window.authentication_complete = () => {
    if (lightdm.is_authenticated) {
        document.documentElement.addEventListener(
            'transitionend',
            () => {lightdm.start_session_sync(localStorage.getItem('session'))}
        );
        document.documentElement.className = 'session_starting';
    } else {
        window.show_message("Authentication Failed", "error");
        setTimeout(() => {
            window.clear_messages();
            lightdm.authenticate();
        }, 3000);
    }
};

/* Theme Functions */
window.clear_messages = () => {
    document.getElementById("messages").innerHTML = "";
    document.getElementById("messages").style.visibility = "hidden";
}

window.handle_input = () => {
    lightdm.respond(document.getElementById("entry").value);
};

window.populate_session_menu = () => {
    let active_session = localStorage.getItem('session') || lightdm.default_session,
        session_menu = document.getElementById('session-menu'),
        session_input = document.getElementById('session-input');

    lightdm.sessions.forEach((session) => {
        let li = document.createElement('li');
        li.setAttribute('key', session.key);
        li.innerText = session.name;
        if (session.key === active_session) {
            li.classList.add('selected');
            session_input.value = session.key;
        }
        session_menu.append(li);
    });
    if (session_input.value === '') {
        session_menu.firstChild.classList.add('selected');
    }

    session_menu.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            if (event.target.parentElement.classList.contains('active')) {
                let was_selected = event.target.classList.contains('selected');

                for (let li of document.getElementsByTagName('li')) {
                    li.classList.remove('selected');
                }
                event.target.classList.add('selected');

                if (was_selected) {
                    event.target.parentElement.classList.remove('active');
                    session_input.value = event.target.getAttribute('key');
                }
            } else {
                event.target.parentElement.classList.add('active');
            }
        }
    }, false);

    session_input.addEventListener(
        'input',
        (event) => {localStorage.setItem('session', event.target.value)}
    )
}

document.getElementById("entry").focus();
window.populate_session_menu();
lightdm.authenticate();
