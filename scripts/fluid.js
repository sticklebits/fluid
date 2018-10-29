function Fluid() {
    this.sections = [];
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
    this.sections = [];
    $('.section').each(function(section) {
        this.sections.push(section);
    }.bind(this));
    console.log('Fluid started with ' + this.sections.length + ' section(s)');
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
            this.update(position);
            this.lastPosition = position;
        }.bind(this));
    }.bind(this));
};

Fluid.prototype.update = function update(position) {
    console.log('Position ' + position);
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