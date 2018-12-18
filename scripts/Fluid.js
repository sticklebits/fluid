function Fluid() {
    this.height = 500;
    this.position = 0;
    this.lastPosition = 0;
    this.helpers = {};
    this.elements = [];
    this.defaults = {
        lead: {
            in: 0,
            out: 0
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
        let params = match[2].split(',').map(function (item) {
            return parseFloat(item);
        });

        if (Object.prototype.hasOwnProperty.call(helpers, key)) {
            let updater = {
                element: element,
                params: params,
                update: helpers[key]
            };
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
    let scrollHeight = this.scroller().getBoundingClientRect().height;
    elements.forEach(function (item) {
        item.updaters.forEach(function (updater) {
            let position = parseFloat(item.element.attr('data-fluid-position-relative') || absolute_position);
            let parentHeight = item.element[0].parentElement.getBoundingClientRect().height;
            let context = {
                timeline: this.timelineContextFromParameters(updater.params, position),
                pos: this.positionContextFromParameters(updater.params, position, parentHeight),
                position: position,
                movement: position - this.lastPosition,
                params: updater.params,
                direction: (position > this.lastPosition) ? 'Down' : (position < this.lastPosition) ? 'Up' : '',
                effect: null
            };
            item.element.find('[data-fluid-effects]').attr('data-fluid-position-relative', context.position);
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
        let timeline = context.timeline;
        if (timeline.range.position < 0 || timeline.range.position >= 100) {
            opacity = 0;
        } else if (timeline.lead.in > 0 && timeline.range.position < timeline.lead.in) {
            opacity = timeline.range.position / timeline.lead.in;
        } else if (timeline.lead.out > 0 && timeline.range.position > (100 - timeline.lead.out)) {
            opacity = 1 - ((timeline.range.position - (100 - timeline.lead.out)) / timeline.lead.out);
        }
        target.css('opacity', opacity);
        return opacity
    };
};

Fluid.prototype.fix = function fix(context) {
    return function (target) {
        let left = context.params[0];
        let top = context.params[1];
        let position = {
            left: left,
            top: context.pos.y
        };
        target.css('left', position.left + 'px');
        target.css('top', position.top + 'px');
        return position;
    };
};

Fluid.prototype.timelineContextFromParameters = function timelineContextFromParameters(params, position) {
    let leadIn = params[2] || this.defaults.lead.in;
    let leadOut = params[3] || this.defaults.lead.out;

    let start = Math.min(params[0], params[0] + leadIn);
    let stop = Math.max(params[1], params[1] - leadOut);

    let rangeSize = stop - start;

    let offset = -start;

    return {
        start: start,
        stop: stop,
        lead: {
            in: Math.abs(leadIn),
            out: Math.abs(leadOut)
        },
        range: {
            size: rangeSize,
            position: (100 / rangeSize) * Math.min(Math.max(start + offset, position + offset), rangeSize)
        }
    };
};

Fluid.prototype.positionContextFromParameters = function positionContextFromParameters(params, position, parentHeight) {
    let x = parseFloat(params[0] || 0);
    let y = parseFloat(params[1] || 0);

    return {
        x: x,
        y: (parentHeight / 100) * (y - position),
        height: parentHeight
    }
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