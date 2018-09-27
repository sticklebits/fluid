function PageControl() {
    this.currentSelection = null;
}

let Data = Object.freeze({
    target: 'data-control-target',
    class: 'data-control-class',
    group: 'data-control-group',
    move: 'data-control-move'
});

PageControl.prototype.start = function start() {
    this.setupToggles();
};

PageControl.prototype.setupToggles = function setupToggles() {
    let classToggles = document.querySelectorAll('.toggle-class');
    Object.keys(classToggles).forEach(function (key) {
        let element = classToggles[key];
        let target = element.getAttribute(Data.target);
        let className = element.getAttribute(Data.class);
        let group = element.getAttribute(Data.group);
        let toggle = target + '-' + group;
        element.addEventListener('click', this.toggleClass(toggle, className, group));
    }.bind(this));
};

PageControl.prototype.toggleClass = function toggleClass(toggle, className, optional_group) {
    return function (event) {
        event.preventDefault();
        document.querySelector('#' + toggle).classList.toggle(className);
        if (optional_group) {
            let members = document.querySelectorAll('[' + Data.group + ']');
            Object.keys(members).forEach(function (key) {
                let element = members[key];
                let targetId = element.getAttribute(Data.target) + '-' + element.getAttribute(Data.group);
                let target = document.querySelector('#' + targetId);
                if (toggle !== targetId) {
                    target.classList.remove(className);
                }
            });
        }
        let navigations = document.querySelectorAll('.navigation-item');
        Object.keys(navigations).forEach(function (key) {
            let element = navigations[key];
            element.classList.remove('highlighted');
        });
        let expanded = document.querySelector('.expanded');
        if (expanded) {
            let currentSelection = expanded.id.replace('-desc', '');
            document.querySelector('.navigation-item.' + currentSelection).classList.add('highlighted');
        }
    };
};