function Fluid() {

}

Fluid.prototype.start = function start() {
    document.addEventListener('scroll', this.updateElements);
};
