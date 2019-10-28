/* global lightdm */

// For local development
if (!('lightdm' in window)) {
    window.lightdm = {
        authenticate: () => {
            window.show_prompt('username:');
        },
        default_session: 'xmonad',
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
        session_menu = document.getElementById('session-menu');

    lightdm.sessions.forEach((session) => {
        let li = document.createElement('li');
        li.setAttribute('key', session.key);
        li.innerText = session.name;
        if (session.key === active_session) {
            li.classList.add('active');
        }
        session_menu.append(li);
    });
}

document.addEventListener('click', (event) => {
    if (event.target.closest('#session-menu') === null) {
        window.mutateSessionList('remove', ['selected'])
        document.getElementById('session-menu').classList.remove('active')
    }
})

window.mutateSessionList = (action, classes) => {
    document.getElementById('session-menu')
        .dispatchEvent(new CustomEvent('mutateMemberClasses', {detail: {action, classes}}))
}

document.getElementById('session-menu')
    .addEventListener('mutateMemberClasses', (event) => {
        for (let li of event.target.getElementsByTagName('li')) {
            li.classList[event.detail.action](...event.detail.classes)
        }
    })

document.getElementById('session-menu').addEventListener('click', (event) => {
    if (event.target.parentElement.classList.contains('active')) {
        if (event.target.classList.contains('selected')) {
            window.mutateSessionList('remove', ['selected', 'active'])
            event.target.classList.add('active');
            localStorage.setItem('session', event.target.getAttribute('key'));
            event.target.parentElement.classList.remove('active');

        } else {
            window.mutateSessionList('remove', ['selected'])
            event.target.classList.add('selected');
        }
    } else {
        event.target.parentElement.classList.add('active');
        for (let li of event.target.parentElement.getElementsByTagName('li')) {
            if (li.classList.contains('active')) {
                li.classList.add('selected');
            }
        }
    }
});

document.getElementById("entry").focus();
window.populate_session_menu();
lightdm.authenticate();
