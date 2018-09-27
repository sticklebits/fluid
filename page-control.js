function PageControl() {

}

PageControl.prototype.start = function start() {
    this.setupToggles();
};

PageControl.prototype.setupToggles = function setupToggles() {
    let classToggles = document.querySelectorAll('.toggle-class');
    Object.keys(classToggles).forEach(function (key) {
        let element = classToggles[key];
        let toggle = element.getAttribute('data-control-target');
        let className = element.getAttribute('data-control-class');
        let group = element.getAttribute('data-control-group');
        element.onclick = this.toggleClass(toggle, className, group);
    }.bind(this));
};

PageControl.prototype.toggleClass = function toggleClass(toggle, className, optional_group) {
    return function (event) {
        event.preventDefault();
        if (optional_group) {
            let members = document.querySelectorAll('[data-control-group]');
            Object.keys(members).forEach(function (key) {
                let element = members[key];
                let targetSelector = element.getAttribute('data-control-target');
                let target = document.querySelector('#' + targetSelector);
                if (toggle !== element.getAttribute(targetSelector)) {
                    target.classList.remove(className);
                }
            });
        }
        document.querySelector('#' + toggle).classList.toggle(className);
    };
};