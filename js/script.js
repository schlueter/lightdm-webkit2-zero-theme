// Functions for the greeter
window.show_prompt = (text, type) => {
	// type is either "text" or "password"
	let prompt = document.getElementById("prompt"),
		entry = document.getElementById("entry");

	entry.placeholder = text.charAt(0).toUpperCase() + text.slice(1, -1);

	// clear entry
	entry.value = "";
	entry.type = type;
};

window.show_message = (text, type) => {
	if (0 === text.length) {
		return;
	}
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
		// Start default session
		// let body = document.getElementById('body');
		document.documentElement.addEventListener('transitionend', () => {lightdm.start_session_sync('xmonad')});
		document.documentElement.className = 'session_starting';
	} else {
		show_message("Authentication Failed", "error");
		setTimeout(start_authentication, 3000);
	}
};

autologin_timer_expired = (username) => {}

// Theme Functions
clear_messages = () => {
	let messages = document.getElementById("messages");
	messages.innerHTML = "";
	messages.style.visibility = "hidden";
}

window.start_authentication = () => {
	clear_messages();
	lightdm.authenticate();
};

window.handle_input = () => {
	let entry = document.getElementById("entry");
	lightdm.respond(entry.value);
};
