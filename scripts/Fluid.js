function Fluid() {
    this.height = 2000;
    this.position = 0;
    this.lastPosition = 0;
    this.helpers = {};
    this.elements = [];
    this.defaults = {
        lead: {
            in: 10,
            out: 10
        }
    };
}

Fluid.prototype.start = function start() {
    let self = this;
    this.setScrollHeight(this.height);
    let elements = [];
    $('[data-fluid-effects]').each(function () {
        let element = $(this);
        elements.push({
            element: element,
            updaters: self.createUpdaters(element, self.helpers)
        });
    });
    this.elements = elements;
    this.update(this.elements, 0);
    return this;
};

Fluid.prototype.addHelper = function addTemplate(id, helper) {
    this.helpers[id] = helper;
    return this;
};

Fluid.prototype.createUpdaters = function createUpdaters(element, helpers) {
    let effects = element.attr('data-fluid-effects').split(' ');
    let updaters = [];
    let defaults = this.defaults;
    effects.forEach(function (helper) {
        let regexp = /([A-z]*)\((.*)\)\s*/mgi;
        let match = regexp.exec(helper);
        let key = match[1];
        let params = match[2].split(',');

        if (Object.prototype.hasOwnProperty.call(helpers, key)) {
            let leadIn = parseFloat(params[2] || defaults.lead.in);
            let leadOut = parseFloat(params[3] || defaults.lead.out);

            let start = Math.min(parseFloat(params[0]), parseFloat(params[0]) + leadIn);
            let stop = Math.max(parseFloat(params[1]), parseFloat(params[1]) - leadOut);

            let updater = {
                element: element,
                start: start,
                stop: stop,
                lead: {
                    in: Math.abs(leadIn),
                    out: Math.abs(leadOut)
                },
                update: helpers[key]
            };
            console.log(updater);
            updaters.push(updater);
        }
    });
    return updaters;
};

Fluid.prototype.processModel = function processModel(model, container) {
    let position = 0;
    container.textContent = null;
    model.forEach(function (item) {
        let element = document.createElement('div');
        element.id = item.id;
        element.innerHTML = this.template(item.id);
        element.style.display = (position >= item.start) && (position <= item.stop) ? 'block' : 'none';
        item.element = element;
        this.updateItem(item, position);
        container.appendChild(element);
    }.bind(this));
};

Fluid.prototype.update = function update(elements, absolute_position) {
    elements.forEach(function (item) {
        item.updaters.forEach(function (updater) {
            let position = parseFloat(item.element.attr('data-fluid-position-relative') || absolute_position);
            let rangeSize = updater.stop - updater.start;

            let offset = -updater.start;

            let range = {
                size: rangeSize,
                position: (100 / rangeSize) * Math.min(Math.max(updater.start + offset, position + offset), rangeSize)
            };

            item.element.find('[data-fluid-effects]').attr('data-fluid-position-relative', range.position);

            let context = {
                position: position,
                movement: position - this.lastPosition,
                start: updater.start,
                stop: updater.stop,
                lead: {
                    in: (100 / rangeSize) * updater.lead.in,
                    out: (100 / rangeSize) * updater.lead.out
                },
                direction: (position > this.lastPosition) ? 'Down' : (position < this.lastPosition) ? 'Up' : '',
                range: range,
                effect: null
            };

            context.effect = {
                fade: this.fade(context),
                fix: this.fix(context)
            };

            updater.update(item.element, context);
        }.bind(this));
    }.bind(this));
};

Fluid.prototype.fade = function fade(context) {
    return function (target) {
        let opacity = 1;
        if (context.range.position < 0 || context.range.position > 100) {
            opacity = 0;
        }
        if (context.range.position < context.lead.in) {
            opacity = context.range.position / context.lead.in;
        } else if (context.range.position > (100 - context.lead.out)) {
            opacity = 1 - ((context.range.position - (100 - context.lead.out)) / context.lead.out);
        }
        target.css('opacity', opacity);
        return opacity
    };
};

Fluid.prototype.fix = function fix(position) {
    return function (target, x, y) {
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
    for (let x = 0; x < this.height; x++) {
        scroller.appendChild(document.createElement('br'));
    }
};

Fluid.prototype.scroller = function scroller() {
    return this.element('scroller', function (element) {
        window.addEventListener('scroll', function () {
            let top = window.pageYOffset || document.documentElement.scrollTop;
            let bounds = element.getBoundingClientRect();
            let position = (100 / (bounds.height - document.documentElement.clientHeight + 16)) * top;
            this.update(this.elements, position);
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