function toggleMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.menu');
    toggle.classList.toggle('close');
    menu.classList.toggle('closed');
}

function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    toggle.addEventListener('click', toggleMenu);
}

window.addEventListener('load', function () {
    initMenu();
});
