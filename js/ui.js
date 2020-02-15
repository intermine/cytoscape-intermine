var metaFields = require('./metaFields'),
  util = require('./util'),
  _ = require('underscore'),
  cy = require('cytoscape'),
  cyStyle = require('./cytoscapeStyle');

var ui = function (graph) {
  _.templateSettings = {
    evaluate: /\{\{(.+?)\}\}/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g
  };

  this.graph = graph;
  var cyto;
  var cyLayout = {
    name: 'cose'
  };
  var templates = {
    cymineHtml: {
      html: require('./../template/cytomine.html'),
      type: "html"
    },
    "InteractionDetail": {
      html: require('./../template/interaction.html'),
      type: "_"
    }
  }

  var display = function (node) {
    graph.targetElem = graph.parentElem.querySelector('nodeDetails');
    setTitle(node);
    listProperties(node);
  };

  var setTitle = function (elem) {
    var title = graph.parentElem.querySelector('.nodeTitle');
    title.innerHTML = elem.title;
  };

  var listProperties = function (node) {
    try {
      var display = expandPropertyVals(node),
        oldNodeInfo = graph.parentElem.querySelector('.nodeInfo');
      display.setAttribute('class', 'nodeInfo');
      oldNodeInfo.parentElement.replaceChild(display, oldNodeInfo);
    } catch (e) {
      console.error('Whoopsie', e);
    }
  };

  var getTemplate = function (chosenTemplate) {
    var template = templates[chosenTemplate];
    if (template.type === "html") {
      return template.html;
    } else if (template.type === "_") {
      return _.template(template.html);
    }
  };
  var hasTemplate = function (chosenTemplate) {
    return (templates[chosenTemplate] && true); //&& true makes it return a boolean
  };

  var expandPropertyVals = function (obj) {
    var display = document.createElement('dl'),
      dtTemp, ddTemp;
    for (var prop in obj) {
      if (metaFields.indexOf(prop) < 0) { //users never want to see objectId.
        dtTemp = document.createElement("dt");
        dtTemp.appendChild(document.createTextNode(prop));
        ddTemp = document.createElement("dd");
        util.addClass(ddTemp, "cym-" + prop);
        if (typeof obj[prop] === "object") {
          if (obj[prop] && hasTemplate(obj[prop].class)) {
            ddTemp.appendChild(expandToTemplate(obj[prop]));
          } else {
            util.addClass(ddTemp, "child");
            ddTemp.appendChild(expandPropertyVals(obj[prop]));
          }
        } else {
          ddTemp.appendChild(document.createTextNode(obj[prop]));
        }

        insertAtStart([dtTemp, ddTemp], display);
      }
    }
    return display;
  };

  var expandToTemplate = function (obj) {
    var myObj = _.clone(obj),
      template = getTemplate(obj.class);

    if (templates[obj.class].additionalFunction) {
      myObj = templates[obj.class].additionalFunction(myObj);
    }
    var temp = document.createElement('div');
    temp.innerHTML = template(myObj);
    return temp;
  };

  var insertAtStart = function (elems, parentContainer) {
    var firstOriginalElem = parentContainer.firstChild;
    for (var i = 0; i < elems.length; i++) {
      parentContainer.insertBefore(elems[i], firstOriginalElem);
    }
  };

  var attachResults = function (errorMessage) {
    if (!errorMessage) {
      initGraph();
    } else {
      noResults(errorMessage);
    }
    return cyto;
  };

  var controls = function () {
    var hiddenElems,
      getControls = function () {
        return graph.parentElem.querySelector('.interactionFilter');
      },
      getReset = function () {
        return graph.parentElem.querySelector('.reset');
      },
      selectInteractionType = function (e) {
        var elem = e.target;
        if ((elem !== e.currentTarget) && (elem.nodeName.toLowerCase() === "button")) {
          //visual button response
          removeAllButtonSelections();
          var elemClass = elem.className; //at this point we've stripped selected off. Should only be the type.
          util.addClass(elem, 'selected');

          //affect the graph:
          //old ones back:
          if (hiddenElems) {
            hiddenElems.restore();
          }
          //we have elemClass, and want to keep them, but hide the others.
          //new ones gone:
          hiddenElems = cyto.elements().filterFn(function (ele) {
            if (elemClass === "default") {
              return !ele;
            }
            return (!ele.hasClass(elemClass) && !ele.hasClass("both") && !ele.hasClass("master"));
          }).remove();
        }
      },
      resetGraph = function () {
        cyto.makeLayout(cyLayout).run();
        getControls().querySelector('.default').click();
      },

      listen = function () {
        getControls().addEventListener('click', selectInteractionType, false);
        getReset().addEventListener('click', resetGraph, false);
      },
      removeAllButtonSelections = function () {
        var theButtons = getControls().querySelectorAll('button');
        for (var i = 0; i < theButtons.length; i++) {
          util.removeClass(theButtons[i], ' selected');
          util.removeClass(theButtons[i], 'selected');
        }
      };
    return {
      listen: listen
    };
  };

  var init = function () {
    graph.parentElem.innerHTML = getTemplate('cymineHtml');
    util.addClass(graph.parentElem, "cymine");
    //init useful elements and store in master settings object
    graph.statusBar = graph.parentElem.querySelector('.status');
    graph.targetElem = graph.parentElem.querySelector('.cy');
    //make the graph as wide as can be. can't be auto as cytoscape needs a width
    graph.targetElem.style.width = graph.parentElem.querySelector('.graph').clientWidth + "px";
    console.log("%cgraph.compact", "color:seagreen;font-weight:bold;", graph.compact, graph);
  };

  var initGraph = function () {
    try {
      var interactionControls = controls();
      interactionControls.listen();

      //make the graph
      cyto = cy({
        container: graph.targetElem,
        layout: cyLayout,
        elements: graph.data,
        style: cyStyle,

        ready: function () {
          graph.statusBar.remove();
        }
      });

    } catch (e) {
      console.error(e);
    }

    //event listener for node taps
    cyto.on('tap', 'node', function () {
      display(this.data());
    });

    cyto.on('tap', 'edge', function () {
      display(this.data());
    });

  };

  var noResults = function (message) {
    if (graph.compact) {
      util.addClass(graph.parentElem, 'compact');
    }
    graph.statusBar.className = "status no-results";
    graph.statusBar.innerHTML = message;
  };


  return {
    init: init,
    attachResults: attachResults,
    noResults: noResults
  };

};

module.exports = ui;
