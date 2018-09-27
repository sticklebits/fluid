function Fluid() {
    this.height = 2000;
    this.position = 0;
    this.lastPosition = 0;
    this.viewModel = [];
    this.defaults = {
        fade: {
            in: 10,
            out: 10
        }
    };
}

Fluid.prototype.start = function start() {
    this.setScrollHeight(this.height);
    this.processViewModel(this.viewModel, this.content());
};

Fluid.prototype.addTemplate = function addTemplate(id, start, stop, update) {
    this.viewModel.push({
        id: id,
        start: start,
        stop: stop,
        update: update
    });
    return this;
};

Fluid.prototype.processViewModel = function processViewModel(viewModel, container) {
    let position = 0;
    container.textContent = null;
    viewModel.forEach(function (item) {
        let element = document.createElement('div');
        element.id = item.id;
        element.innerHTML = this.template(item.id);
        element.style.display = (position >= item.start) && (position <= item.stop) ? 'block' : 'none';
        item.element = element;
        this.updateItem(item, position);
        container.appendChild(element);
    }.bind(this));
};

Fluid.prototype.update = function update(viewModel, position) {
    viewModel.forEach(function (item) {
        let element = item.element;
        if (!(element instanceof Node)) {
            return;
        }
        element.style.display = (position >= item.start) && (position <= item.stop) ? 'block' : 'none';
        if (element.style.display === 'none') {
            return;
        }
        this.updateItem(item, position);
    }.bind(this));
};

Fluid.prototype.updateItem = function updateItem(item, position) {
    if (typeof item.update === 'function') {
        let range = item.stop - item.start;
        let rangePosition = Math.min(Math.max(item.start, position), item.stop) - item.start;
        rangePosition = (100 / range) * rangePosition;
        item.update(item.element, {
            position: position,
            movement: position - this.lastPosition,
            direction: (position > this.lastPosition) ? 'Down' : (position < this.lastPosition) ? 'Up' : '',
            range: {
                position: rangePosition
            },
            effect: {
                fade: this.fade(rangePosition),
                fix: this.fix(position)
            }
        });
    }
};

Fluid.prototype.fade = function fade(rangePosition) {
    let defaults = this.defaults;
    return function (target, optional_fadeIn, optional_fadeOut) {
        let fadeIn = optional_fadeIn || defaults.fade.in;
        let fadeOut = optional_fadeOut || optional_fadeIn || defaults.fade.out;
        let opacity = 1;
        if (rangePosition < fadeIn) {
            opacity = rangePosition / fadeIn;
        } else if (rangePosition > (100 - fadeOut)) {
            opacity = 1 - ((rangePosition - (100 - fadeOut)) / fadeOut);
        }
        target.style.opacity = opacity;
        return opacity;
    };
};

Fluid.prototype.fix = function fix(position) {
    return function(target, x, y) {
        if (typeof x === 'number') {
            target.style.left = x + 'px';
        }
        if (typeof y === 'number') {
            target.style.top = (y + position) + 'px';
        }
    };
};

Fluid.prototype.setScrollHeight = function setScrollHeight(height) {
    let scroller = this.scroller();
    scroller.textContent = null;
    for (let x = 0; x < this.height; x ++) {
        scroller.appendChild(document.createElement('br'));
    }
};

Fluid.prototype.scroller = function scroller() {
    return this.element('scroller', function (element) {
        document.addEventListener('scroll', function() {
            let top  = window.pageYOffset || document.documentElement.scrollTop;
            let bounds = element.getBoundingClientRect();
            let position = (100 / (bounds.height - document.documentElement.clientHeight + 16)) * top;
            this.update(this.viewModel, position);
            this.lastPosition = position;
        }.bind(this));
    }.bind(this));
};

Fluid.prototype.content = function content() {
    return this.element('fluid-content');
};

Fluid.prototype.element = function element(id, config) {
    if (!this.hasElement(id)) {
        let element = document.createElement('div');
        element.id = id;
        document.querySelector('body').appendChild(element);
        if (typeof config === 'function') {
            config(element);
        }
    }
    return document.querySelector('#' + id);
};

Fluid.prototype.hasElement = function hasElement(id) {
    return document.querySelector('#' + id) instanceof Node;
};

Fluid.prototype.template = function template(id) {
    return document.querySelector('#' + id + '-template').innerHTML;
};