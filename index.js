var ejs = require('elastic.js');

function Builder(mappings, queryParams) {
  this.request = ejs.Request()
  this.mappings = mappings;
  this.queryParams = queryParams
}

Builder.prototype._hasAggregations = function() {
  return this.mappings.hasOwnProperty('aggregations')
}

Builder.prototype._hasGlobalAggregations = function() {
  return this.mappings.aggregations.hasOwnProperty('global')
}

Builder.prototype._applyGlobalAggregations = function() {
  var self = this
  var globalAgg = ejs.GlobalAggregation('global')
  this.mappings.aggregations.global.forEach(function(aggregation){
    var termAgg = ejs.TermsAggregation(aggregation.name)
      .field(aggregation.field)
      .include(self.queryParams.search)
    self.request.agg(globalAgg.agg(termAgg))
  })
};

Builder.prototype._processAggregations = function() {
  if (this._hasAggregations()) {
    if (this._hasGlobalAggregations()) { 
      this._applyGlobalAggregations()
      return;
    }
  }
}

Builder.prototype.process = function() {
  this._processAggregations()
  console.log(JSON.stringify(this.request))
};

module.exports = Builder;