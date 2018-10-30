function FluidEffect(element, key, parameters) {
    switch (key) {
        case FluidEffectKey.fadeIn:
            this.effect = FluidEffect.prototype.fadeIn(element, parameters);
            break;
        case FluidEffectKey.fadeOut:
            this.effect = FluidEffect.prototype.fadeOut(element, parameters);
            break;
    }
}

let FluidEffectKey = Object.freeze({
    fadeIn: 'fade-in',
    fadeOut: 'fade-out'
});

let FluidEffect = {};

function FluidEffectFadeIn function fadeIn(element, parameters) {
    let start = parameters[0] || 0;
    let end = fadeIn + (parameters[1] || this.default.duration);
    return function (position) {

    };
};

FluidEffect.prototype.fadeOut = function fadeOut(element, parameters) {
    let end = parameters[0] || 100;
    let start = end - (parameters[1] || this.default.duration);
    return function (position) {

    };
};