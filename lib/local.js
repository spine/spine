
  if (typeof Spine === "undefined" || Spine === null) Spine = require('spine');

  Spine.Model.Local = {
    extended: function() {
      this.change(this.saveLocal);
      return this.fetch(this.loadLocal);
    },
    saveLocal: function() {
      var result;
      result = JSON.stringify({
        records: this,
        idCounter: this.idCounter
      });
      return localStorage[this.className] = result;
    },
    loadLocal: function() {
      var idCounter, records, result, _ref;
      result = localStorage[this.className];
      _ref = JSON.parse(result) || {}, records = _ref.records, idCounter = _ref.idCounter;
      this.refresh(records || [], {
        clear: true
      });
      return this.idCounter = idCounter || 0;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Model.Local;
  }
