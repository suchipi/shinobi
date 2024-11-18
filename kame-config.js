const { defaultResolver, defaultLoader } = require("kame");

exports.resolve = (id, fromFilePath) => {
  if (id.startsWith("quickjs:")) {
    return "external:" + id;
  }

  return defaultResolver.resolve(id, fromFilePath);
};

exports.load = (filename) => {
  if (/minimatch/.test(filename)) {
    return defaultLoader.loadJsCompiled(filename, { target: "es5" });
  } else {
    return defaultLoader.load(filename, { target: "es2020" });
  }
};
