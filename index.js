var Logger = require("./src/Logger");

module.exports.Logger = Logger;
module.exports.Level = require("./src/Level");
module.exports.log = Logger.log;
module.exports.trace = Logger.trace;
module.exports.debug = Logger.debug;
module.exports.info = Logger.info;
module.exports.warn = Logger.warn;
module.exports.error = Logger.error;
module.exports.fatal = Logger.fatal;