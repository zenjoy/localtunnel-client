var stream = require('stream');
var util = require('util');

var Transform = stream.Transform;

var HeaderHostTransformer = function(opts) {
    if (!(this instanceof HeaderHostTransformer)) {
        return new HeaderHostTransformer(opts);
    }

    opts = opts || {}
    Transform.call(this, opts);

    var self = this;
    self.host = opts.host || 'localhost';
    self.port = opts.port;
    self.scheme = opts.scheme || 'http'; 
    self.replaced = false;
}
util.inherits(HeaderHostTransformer, Transform);

HeaderHostTransformer.prototype._transform = function (chunk, enc, cb) {
    var self = this;

    // after replacing the first instance of the Host header
    // we just become a regular passthrough
    if (!self.replaced) {
        chunk = chunk.toString();
        let replaced = chunk.replace(/(\r\n[Hh]ost: )\S+/, function(match, $1) {
            return $1 + self.host + ':' + self.port;
        }).replace(/(\r\nx-forwarded-host: )\S+/, function(match, $1) {
            return '';
        }).replace(/(\r\nx-scheme: )\S+/, function(match, $1) {
            return '';
        }).replace(/(\r\nx-forwarded-proto: )\S+/, function(match, $1) {
            return '';
        });
        self.push(replaced);
    }
    else {
        self.push(chunk);
    }

    cb();
};

module.exports = HeaderHostTransformer;
