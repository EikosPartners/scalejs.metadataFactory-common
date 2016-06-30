var bindings = {
    'globalNavlinks': function (ctx) {
        var navLinks = this.navLinks().filter(function (link) {
                return link.inNav !== false;
        })
        return {
            foreach : navLinks
        }
    }
}

export default bindings;
