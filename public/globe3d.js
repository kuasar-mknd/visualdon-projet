"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var d3 = _interopRequireWildcard(require("d3"));
var versor = _interopRequireWildcard(require("versor"));
var topojson = _interopRequireWildcard(require("topojson-client"));
var _land50m = _interopRequireDefault(require("./data/land-50m.json"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//import d3

// définir les dimensions de la carte
var width = 960;
var height = 600;
var sphere = {
  type: "Sphere"
};
var land50 = d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/feature/globe-3d/src/data/land-50m.json").then(function (world) {
  return topojson.feature(world, world.objects.land);
});
var projection = d3['geoOrthographic']().precision(0.1);
function drag(projection) {
  var v0, q0, r0, a0, l;
  function pointer(event, that) {
    var t = d3.pointers(event, that);
    if (t.length !== l) {
      l = t.length;
      if (l > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
      dragstarted.apply(that, [event, that]);
    }

    // For multitouch, average positions and compute rotation.
    if (l > 1) {
      var x = d3.mean(t, function (p) {
        return p[0];
      });
      var y = d3.mean(t, function (p) {
        return p[1];
      });
      var a = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
      return [x, y, a];
    }
    return t[0];
  }
  function dragstarted(event) {
    v0 = versor.cartesian(projection.invert(pointer(event, this)));
    q0 = versor(r0 = projection.rotate());
  }
  function dragged(event) {
    var p = pointer(event, this);
    var v1 = versor.cartesian(projection.rotate(r0).invert(p));
    var delta = versor.delta(v0, v1);
    var q1 = versor.multiply(q0, delta);

    // For multitouch, compose with a rotation around the axis.
    if (p[2]) {
      var d = (p[2] - a0) / 2;
      var s = -Math.sin(d);
      var c = Math.sign(Math.cos(d));
      q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
    }
    projection.rotate(versor.rotation(q1));

    // In vicinity of the antipode (unstable) of q0, restart.
    if (delta[0] < 0.7) dragstarted.apply(this, [event, this]);
  }
  return d3.drag().on("start", dragstarted).on("drag", dragged);
}
function chart() {
  var context = d3.select("canvas").node().getContext("2d");
  var path = d3.geoPath(projection, context);
  function render(land) {
    console.log("render");
    context.clearRect(0, 0, width, height);
    context.beginPath(), path(sphere), context.fillStyle = "#fff", context.fill();
    context.beginPath(), path(land), context.fillStyle = "#000", context.fill();
    context.beginPath(), path(sphere), context.stroke();
    console.log("render end");
  }
  return d3.select(context.canvas).call(drag(projection).on("drag.render", function () {
    return render(land50);
  }).on("end.render", function () {
    return render(land50);
  })).call(function () {
    return render(land50);
  }).node();
}
console.log("test");
chart();