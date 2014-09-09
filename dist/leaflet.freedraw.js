/*! leaflet.freedraw by Adam Timberlake <adam.timberlake@gmail.com> created on 2014-09-09 */
!function(a,b,c,d){"use strict";b.freeDraw=function(a){return new b.FreeDraw(a)},b.FreeDraw=b.FeatureGroup.extend({map:null,state:[],svg:{},element:{},creating:!1,lineFunction:function(){},latLngs:[],options:{},lastNotification:"",markerLayer:b.layerGroup(),hull:{},memory:{},polygons:[],edges:[],mode:1,polygonCount:0,fromPoint:{x:0,y:0},movingEdge:null,boundaryUpdateRequired:!1,silenced:!1,RECOUNT_TIMEOUT:1,initialize:function(a){"undefined"==typeof c&&b.FreeDraw.Throw("D3 is a required library","http://d3js.org/"),"undefined"==typeof d&&b.FreeDraw.Throw("JSClipper is a required library","http://sourceforge.net/p/jsclipper/wiki/Home%206/"),this.fromPoint={x:0,y:0},this.polygons=[],this.edges=[],this.hull={},this.latLngs=[],a=a||{},this.memory=new b.FreeDraw.Memory,this.options=new b.FreeDraw.Options,this.hull=new b.FreeDraw.Hull,this.element=a.element||null,this.setMode(a.mode||this.mode),this.options.setPathClipperPadding(100)},recreateEdges:function(a){return this.edges=this.edges.filter(function(b){return b._freedraw.polygon!==a?!0:void this.map.removeLayer(b)}.bind(this)),this.createEdges(a)},resurrectOrphans:function(){var a=function(a){setTimeout(function(){this.silently(function(){this.recreateEdges(a)}.bind(this))}.bind(this))},b=this.getPolygons(!0);b.forEach(function(b){b._parts[0]&&a.call(this,b)}.bind(this)),setTimeout(function(){this.notifyBoundaries()}.bind(this))},onAdd:function(a){a.on("zoomend",function(){setTimeout(this.resurrectOrphans.bind(this))}.bind(this)),this.map=a,this.mode=this.mode||b.FreeDraw.MODES.VIEW,this.element||(this.element=a._container),this.lineFunction=c.svg.line().x(function(a){return a.x}).y(function(a){return a.y}).interpolate("linear"),this.createD3(),this._attachMouseDown(),this._attachMouseMove(),this._attachMouseUpLeave(),this.setMode(this.mode)},onRemove:function(){this._clearPolygons()},silently:function(a){this.silenced=!0,a.apply(this),this.silenced=!1},cancelAction:function(){this.creating=!1,this.movingEdge=null,this.destroyD3().createD3()},setMapPermissions:function(a){this.map.dragging[a](),this.map.touchZoom[a](),this.map.doubleClickZoom[a](),this.map.scrollWheelZoom[a]()},setMode:function(a){if(a=0===a?b.FreeDraw.MODES.VIEW:a,this.mode=a,this.fire("mode",{mode:a}),this.map){var c=!!(a&b.FreeDraw.MODES.CREATE),d=c?"disable":"enable";this.map.dragging[d](),!this.boundaryUpdateRequired||this.mode&b.FreeDraw.MODES.EDIT||(this.notifyBoundaries(),this.boundaryUpdateRequired=!1,this.options.memoriseEachEdge||this.memory.save(this.getPolygons(!0))),function(b,c,d,e){e(c,"mode-create"),e(c,"mode-edit"),e(c,"mode-delete"),e(c,"mode-view"),e(c,"mode-append"),a&b.CREATE&&d(c,"mode-create"),a&b.EDIT&&d(c,"mode-edit"),a&b.DELETE&&d(c,"mode-delete"),a&b.VIEW&&d(c,"mode-view"),a&b.APPEND&&d(c,"mode-append")}(b.FreeDraw.MODES,this.map._container,b.DomUtil.addClass,b.DomUtil.removeClass)}},unsetMode:function(a){this.setMode(this.mode^a)},createD3:function(){this.svg=c.select(this.options.element||this.element).append("svg").attr("class",this.options.svgClassName).attr("width",200).attr("height",200)},destroyD3:function(){return this.svg.remove(),this.svg={},this},latLngsToClipperPoints:function(a){return a.map(function(a){var b=this.map.latLngToLayerPoint(a);return{X:b.x,Y:b.y}}.bind(this))},clipperPolygonsToLatLngs:function(a){var c=[];return a.forEach(function(a){a.forEach(function(a){a=b.point(a.X,a.Y);var d=this.map.layerPointToLatLng(a);c.push(d)}.bind(this))}.bind(this)),c},uniqueLatLngs:function(a){var b=[],c=[];return a.forEach(function(a){var d=JSON.stringify(a);-1===b.indexOf(d)&&(b.push(d),c.push(a))}),c},handlePolygonClick:function(a,c){var d=[],e=this.map.mouseEventToContainerPoint(c.originalEvent),f=1/0,g=new b.Point,h=new b.Point,i=[];a._latlngs.forEach(function(a){i.push(this.map.latLngToContainerPoint(a))}.bind(this)),i.forEach(function(a,c){var d=a,j=i[c+1]||i[0],k=b.LineUtil.pointToSegmentDistance(e,d,j);f>k&&(f=k,g=d,h=j)}.bind(this)),i.forEach(function(a,b){var c=i[b+1]||i[0];return a===g&&c===h?(d.push(this.map.containerPointToLatLng(a)),void d.push(this.map.containerPointToLatLng(e))):void d.push(this.map.containerPointToLatLng(a))}.bind(this));var j=this.options.elbowDistance,k=function(){this.mode&b.FreeDraw.MODES.APPEND&&(a.setLatLngs(d),this.destroyEdges(a),this.createEdges(a))}.bind(this);if(this.mode&b.FreeDraw.MODES.APPEND&&!(this.mode&b.FreeDraw.MODES.DELETE)){if(this.options.onlyInDistance&&f>j)return;return void k()}return this.mode&b.FreeDraw.MODES.DELETE&&!(this.mode&b.FreeDraw.MODES.APPEND)?void this.destroyPolygon(a):f>j&&this.mode&b.FreeDraw.MODES.DELETE?void this.destroyPolygon(a):void k()},createPolygon:function(a,c){if(!this.options.multiplePolygons&&this.getPolygons(!0).length>=1)return!1;if(this.destroyD3().createD3(),this.options.simplifyPolygon&&(a=function(){var b=d.Clipper.CleanPolygon(this.latLngsToClipperPoints(a),1.1),c=d.Clipper.SimplifyPolygon(b,d.PolyFillType.pftNonZero);return this.clipperPolygonsToLatLngs(c)}.apply(this)),a.length<=3&&!c)return!1;var e=new b.Polygon(a,{color:"#D7217E",weight:0,fill:!0,fillColor:"#D7217E",fillOpacity:.75,smoothFactor:this.options.smoothFactor});return e.on("click",function(a){this.handlePolygonClick(e,a)}.bind(this)),e.addTo(this.map),this.polygons.push(e),this.createEdges(e),function(){!this.silenced&&e._parts[0]&&(e._latlngs=[],e._parts[0].forEach(function(a){e._latlngs.push(this.map.layerPointToLatLng(a))}.bind(this)))}.bind(this)(),this.options.attemptMerge&&!this.silenced&&this.mergePolygons(),this.silenced||(this.notifyBoundaries(),this.memory.save(this.getPolygons(!0))),e},undo:function(){this._modifyState("undo")},redo:function(){this._modifyState("redo")},_modifyState:function(a){this.silently(this._clearPolygons.bind(this));var b=this.memory[a]();b.forEach(function(a){this.silently(function(){this.createPolygon(a)}.bind(this))}.bind(this)),this.notifyBoundaries()},getPolygons:function(a){var b=[];if(a){if(!this.map)return[];var c="G";for(var d in this.map._layers)if(this.map._layers.hasOwnProperty(d)){var e=this.map._layers[d];e._container&&e._container.tagName.toUpperCase()===c&&b.push(e)}}else this.edges.forEach(function(a){-1===b.indexOf(a._freedraw.polygon)&&b.push(a._freedraw.polygon)}.bind(this));return b},mergePolygons:function(){var a=function(){var a=this.getPolygons(),c=[];a.forEach(function(a){c.push(this.latLngsToClipperPoints(a._latlngs))}.bind(this));var e=d.Clipper.SimplifyPolygons(c,d.PolyFillType.pftNonZero);this.silently(function(){this._clearPolygons(),e.forEach(function(a){var c=[];a.forEach(function(a){a=b.point(a.X,a.Y),c.push(this.map.layerPointToLatLng(a))}.bind(this)),this.createPolygon(c,!0)}.bind(this))})}.bind(this);a(),a(),this.getPolygons(!0).forEach(this.trimPolygonEdges.bind(this))},destroyPolygon:function(a){this.map.removeLayer(a);var c=this.polygons.indexOf(a);this.polygons.splice(c,1),this.destroyEdges(a),this.silenced||(this.notifyBoundaries(),this.memory.save(this.getPolygons(!0))),this.options.deleteExitMode&&!this.silenced&&this.setMode(this.mode^b.FreeDraw.MODES.DELETE)},destroyEdges:function(a){this.edges=this.edges.filter(function(b){return b._freedraw.polygon!==a?!0:void this.map.removeLayer(b)}.bind(this))},clearPolygons:function(){this.silently(this._clearPolygons),this.silenced||(this.notifyBoundaries(),this.memory.save(this.getPolygons(!0)))},_clearPolygons:function(){this.getPolygons().forEach(function(a){this.destroyPolygon(a)}.bind(this)),this.silenced||this.notifyBoundaries()},notifyBoundaries:function(){var a=[];this.getPolygons(!0).forEach(function(b){a.push(b._latlngs)}.bind(this)),function(){a.forEach(function(a){var b=a.length-1;if(b&&a[0]&&a[b]){var c=a[0].lat!==a[b].lat,d=a[0].lng!==a[b].lng;c&&d&&a.push(a[0])}})}.bind(this)(),this.polygonCount=a.length;var b=JSON.stringify(a);this.lastNotification!==b&&(this.lastNotification=b,this.fire("markers",{latLngs:a}),setTimeout(this.emitPolygonCount.bind(this),this.RECOUNT_TIMEOUT))},emitPolygonCount:function(){var a="M0 0",b=this.getPolygons(!0),c=b.every(function(b){var c=b._container.lastChild.getAttribute("d").trim();return c===a});c&&(this.silently(function(){this._clearPolygons(),this.fire("markers",{latLngs:[]}),this.fire("count",{count:this.polygonCount})}.bind(this)),this.polygonCount=0,b.length=0),b.length!==this.polygonCount&&(this.polygonCount=b.length,this.fire("count",{count:this.polygonCount}))},createEdges:function(a){var c=function(a){return a._parts[0]?a._latlngs.map(function(a){return this.map.latLngToLayerPoint(a)}.bind(this)):[]}.bind(this),d=this.uniqueLatLngs(c(a)),e=0;return d?(d.forEach(function(c){var d=b.divIcon({className:this.options.iconClassName}),f=this.map.layerPointToLatLng(c);d=b.marker(f,{icon:d}).addTo(this.map),d._freedraw={polygon:a,polygonId:a._leaflet_id,latLng:d._latlng},this.edges.push(d),e++,d.on("mousedown touchstart",function(a){a.originalEvent.preventDefault(),a.originalEvent.stopPropagation(),this.movingEdge=a.target}.bind(this))}.bind(this)),e):!1},updatePolygonEdge:function(a,c,d){var e=this.map.containerPointToLatLng(new b.Point(c,d));a.setLatLng(e),a._freedraw.latLng=e;var f=[],g=this.edges.filter(function(b){return f.push(b),b._freedraw.polygon===a._freedraw.polygon});this.edges=f;var h=[];g.forEach(function(a){h.push(a.getLatLng())}),a._freedraw.polygon.setLatLngs(h),a._freedraw.polygon.redraw()},_attachMouseDown:function(){this.map.on("mousedown touchstart",function(a){var c=2;if(a.originalEvent.button!==c){var d=a.originalEvent;d.stopPropagation(),d.preventDefault(),this.latLngs=[],this.fromPoint={x:d.clientX,y:d.clientY},this.mode&b.FreeDraw.MODES.CREATE&&(this.creating=!0,this.setMapPermissions("disable"))}}.bind(this))},_attachMouseMove:function(){this.map.on("mousemove touchmove",function(a){var b=a.originalEvent;return this.movingEdge?void this._editMouseMove(b):void(this.creating&&this._createMouseMove(b))}.bind(this))},_editMouseMove:function(a){var c=new b.Point(a.clientX,a.clientY),d=this.movingEdge._icon.style;d[b.DomUtil.TRANSFORM]=c,this.updatePolygonEdge(this.movingEdge,c.x,c.y)},_attachMouseUpLeave:function(){var b=function(){return this.movingEdge?(this.options.boundariesAfterEdit?this.boundaryUpdateRequired=!0:this.notifyBoundaries(),this.trimPolygonEdges(this.movingEdge._freedraw.polygon),this.mergePolygons(),this.movingEdge=null,this.options.memoriseEachEdge&&this.memory.save(this.getPolygons(!0)),void setTimeout(this.emitPolygonCount.bind(this),this.RECOUNT_TIMEOUT)):void this._createMouseUp()}.bind(this);this.map.on("mouseup touchend",b);var c=a.document.getElementsByTagName("body")[0];c.onmouseleave=b},trimPolygonEdges:function(a){var b=[];a._parts[0]&&(a._parts[0].forEach(function(a){b.push(this.map.layerPointToLatLng(a))}.bind(this)),a.setLatLngs(b),a.redraw(),this.destroyEdges(a),this.createEdges(a))},_createMouseMove:function(a){var c=a.clientX,d=a.clientY,e=new b.Point(c,d),f=this.map.containerPointToLatLng(e),g=[this.fromPoint,{x:c,y:d}];this.svg.append("path").attr("d",this.lineFunction(g)).attr("stroke","#D7217E").attr("stroke-width",2).attr("fill","none"),this.fromPoint.x=c,this.fromPoint.y=d,this.latLngs.push(f)},_createMouseUp:function(){if(this.creating&&(this.creating=!1,this.setMapPermissions("enable"),!(this.latLngs.length<=2))){if(this.options.hullAlgorithm){this.hull.setMap(this.map);var a=this.hull[this.options.hullAlgorithm](this.latLngs)}this.latLngs.push(this.latLngs[0]);var c=this.createPolygon(a||this.latLngs);c&&(this.latLngs=[],this.options.createExitMode&&this.setMode(this.mode^b.FreeDraw.MODES.CREATE))}}}),b.FreeDraw.MODES={VIEW:1,CREATE:2,EDIT:4,DELETE:8,APPEND:16,EDIT_APPEND:20,ALL:31},b.FreeDraw.Throw=function(b,c){throw c&&a.console.error("http://"===c.substr(0,7)||"https://"===c.substr(0,8)?c:"See: https://github.com/Wildhoney/Leaflet.FreeDraw/blob/master/EXCEPTIONS.md#"+c),"Leaflet.FreeDraw: "+b+"."}}(window,window.L,window.d3,window.ClipperLib),function(){"use strict";L.FreeDraw.Hull=function(){},L.FreeDraw.Hull.prototype={map:null,setMap:function(a){this.map=a},brian3kbGrahamScan:function(a){var b=new ConvexHullGrahamScan,c=[],d=[],e=[];a.forEach(function(a){d.push(this.map.latLngToLayerPoint(a))}.bind(this)),d.forEach(function(a){b.addPoint(a.x,a.y)}.bind(this));var f=b.getHull();return f.forEach(function(a){c.push(L.point(a.x,a.y))}.bind(this)),c.push(c[0]),c.forEach(function(a){e.push(this.map.layerPointToLatLng(a))}.bind(this)),e},wildhoneyConcaveHull:function(a){return a.push(a[0]),new ConcaveHull(a).getLatLngs()}}}(),function(){"use strict";L.FreeDraw.Memory=function(){},L.FreeDraw.Memory.prototype={states:[[]],current:0,save:function(a){this.current++,this.states[this.current]&&this.clearFrom(this.current),this.states[this.current]||(this.states[this.current]=[]),a.forEach(function(a){this.states[this.current].push(a._latlngs)}.bind(this))},undo:function(){return this.current--,this.states[this.current]||this.current++,this.states[this.current]},canUndo:function(){return!!this.states[this.current-1]},redo:function(){return this.current++,this.states[this.current]||this.current--,this.states[this.current]},canRedo:function(){return!!this.states[this.current+1]},clearFrom:function(a){this.states.splice(a)}}}(),function(a,b){"use strict";b.FreeDraw.Options=function(){},b.FreeDraw.Options.prototype={multiplePolygons:!0,simplifyPolygon:!0,hullAlgorithm:"wildhoneyConcaveHull",boundariesAfterEdit:!1,createExitMode:!0,attemptMerge:!0,svgClassName:"tracer",smoothFactor:5,iconClassName:"polygon-elbow",deleteExitMode:!1,memoriseEachEdge:!0,elbowDistance:10,onlyInDistance:!1,hullAlgorithms:{"brian3kb/graham_scan_js":{method:"brian3kbGrahamScan",name:"Graham Scan JS",global:"ConvexHullGrahamScan",link:"https://github.com/brian3kb/graham_scan_js"},"Wildhoney/ConcaveHull":{method:"wildhoneyConcaveHull",name:"Concave Hull",global:"ConcaveHull",link:"https://github.com/Wildhoney/ConcaveHull"}},setMemoriseEachEdge:function(a){this.memoriseEachEdge=!!a},addElbowOnlyWithinDistance:function(a){this.onlyInDistance=!!a},setPathClipperPadding:function(a){b.Path.CLIP_PADDING=a},setMaximumDistanceForElbow:function(a){this.elbowDistance=+a},exitModeAfterCreate:function(a){this.createExitMode=!!a},exitModeAfterDelete:function(a){this.deleteExitMode=!!a},allowMultiplePolygons:function(a){this.multiplePolygons=!!a},setSVGClassName:function(a){this.svgClassName=a},setBoundariesAfterEdit:function(a){this.boundariesAfterEdit=!!a},setSmoothFactor:function(a){this.smoothFactor=+a},setIconClassName:function(a){this.iconClassName=a},setHullAlgorithm:function(c){(!c||this.hullAlgorithms.hasOwnProperty(c))&&(c=this.hullAlgorithms[c],"undefined"==typeof a[c.global]&&b.FreeDraw.Throw(c.name+" is a required library for concave/convex hulls",c.link),this.hullAlgorithm=c.method)}}}(window,window.L),function(){"use strict";L.FreeDraw.Utilities={getMySQLMultiPolygon:function(a){var b=[];return a.forEach(function(a){var c=[];a.forEach(function(a){c.push(a.lat+" "+a.lng)}),b.push("(("+c.join(",")+"))")}),"MULTIPOLYGON("+b.join(",")+")"},getMySQLPolygons:function(a){var b=[];return a.forEach(function(a){var c=[];a.forEach(function(a){c.push(a.lat+" "+a.lng)}),b.push("POLYGON(("+c.join(",")+"))")}),b}}}();