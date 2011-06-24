(function() {
  Spine || (Spine = require("spine"));
  Spine.Model.Local = {
    extended: function() {
      this.change(this.proxy(this.saveLocal));
      return this.fetch(this.proxy(this.loadLocal));
    },
    saveLocal: function() {
      var result;
      result = JSON.stringify(this);
      return localStorage[this.className] = result;
    },
    loadLocal: function() {
      var result;
      result = localStorage[this.className];
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
