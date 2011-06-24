(function() {
  Spine || (Spine = require("spine"));
  Spine.Model.Local = {
    extended: function() {
      this.sync(this.proxy(this.saveLocal));
      return this.fetch(this.proxy(this.loadLocal));
    },
    saveLocal: function() {
      var result;
      result = JSON.stringify(this);
      return localStorage[this.name] = result;
    },
    loadLocal: function() {
      var result;
      result = localStorage[this.name];
      if (!result) {
        return;
      }
      result = JSON.parse(result);
      return this.refresh(result, {
        clear: true
      });
    }
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Model.Local;
  }
}).call(this);
