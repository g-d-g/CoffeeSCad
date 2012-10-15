// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
    var $, GlThreeView, GlViewSettings, MyAxisHelper, THREE, csg, marionette, requestAnimationFrame, threedView_template;
    $ = require('jquery');
    marionette = require('marionette');
    csg = require('csg');
    THREE = require('three');
    THREE.CSG = require('three_csg');
    threedView_template = require("text!templates/3dview.tmpl");
    requestAnimationFrame = require('anim');
    GlViewSettings = (function(_super) {

      __extends(GlViewSettings, _super);

      function GlViewSettings() {
        return GlViewSettings.__super__.constructor.apply(this, arguments);
      }

      GlViewSettings.prototype.defaults = {
        antialiasing: true,
        showGrid: true,
        showAxis: true
      };

      return GlViewSettings;

    })(Backbone.Model);
    MyAxisHelper = (function() {

      function MyAxisHelper(size, xcolor, ycolor, zcolor) {
        var geometry, material;
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-size || -1, 0, 0), new THREE.Vector3(size || 1, 0, 0), new THREE.Vector3(0, -size || -1, 0), new THREE.Vector3(0, size || 1, 0), new THREE.Vector3(0, 0, -size || -1), new THREE.Vector3(0, 0, size || 1));
        geometry.colors.push(new THREE.Color(xcolor || 0xffaa00), new THREE.Color(xcolor || 0xffaa00), new THREE.Color(ycolor || 0xaaff00), new THREE.Color(ycolor || 0xaaff00), new THREE.Color(zcolor || 0x00aaff), new THREE.Color(zcolor || 0x00aaff));
        material = new THREE.LineBasicMaterial({
          vertexColors: THREE.VertexColors,
          linewidth: 2
        });
        return new THREE.Line(geometry, material, THREE.LinePieces);
      }

      return MyAxisHelper;

    })();
    GlThreeView = (function(_super) {

      __extends(GlThreeView, _super);

      GlThreeView.prototype.template = threedView_template;

      GlThreeView.prototype.ui = {
        renderBlock: "#glArea",
        overlayBlock: "#glOverlay"
      };

      GlThreeView.prototype.events = {
        'mousewheel': 'mousewheel',
        'mousedown': 'mousedown',
        'contextmenu': 'rightclick'
      };

      GlThreeView.prototype.rightclick = function(ev) {};

      GlThreeView.prototype.mousewheel = function(ev) {
        /*ev = window.event or ev; # old IE support  
        delta = Math.max(-1, Math.min(1, (ev.wheelDelta or -ev.detail)))
        delta*=75
        if delta - @camera.position.z <= 100
          @camera.position.z-=delta
        return false
        */

      };

      GlThreeView.prototype.mousemove = function(ev) {
        var moveMinMax, x_move, y_move;
        if (this.dragStart != null) {
          moveMinMax = 10;
          this.dragAmount = [this.dragStart.x - ev.offsetX, this.dragStart.y - ev.offsetY];
          x_move = Math.max(-moveMinMax, Math.min(moveMinMax, this.dragAmount[0] / 10));
          y_move = Math.max(-moveMinMax, Math.min(moveMinMax, this.dragAmount[1] / 10));
          this.camera.position.x += x_move;
          this.camera.position.y -= y_move;
          return false;
        }
      };

      GlThreeView.prototype.dragstart = function(ev) {
        return this.dragStart = {
          'x': ev.offsetX,
          'y': ev.offsetY
        };
      };

      GlThreeView.prototype.mouseup = function(ev) {
        var v, x, y;
        if (this.dragStart != null) {
          this.dragAmount = [this.dragStart.x - ev.offsetX, this.dragStart.y - ev.offsetY];
          this.dragStart = null;
        }
        /*console.log ev
        console.log "clientX: #{ev.clientX} clientY: #{ev.clientY}"
        console.log "clientX: #{ev.offsetX} clientY: #{ev.offsetY}"
        */

        x = ev.offsetX;
        y = ev.offsetY;
        return v = new THREE.Vector3((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1, 0.5);
      };

      GlThreeView.prototype.mousedown = function(ev) {
        var x, y;
        x = ev.offsetX;
        y = ev.offsetY;
        return this.selectObj(x, y);
      };

      GlThreeView.prototype.selectObj = function(mouseX, mouseY) {
        var intersects, newMat, ray, reset_col, v,
          _this = this;
        v = new THREE.Vector3((mouseX / this.width) * 2 - 1, -(mouseY / this.height) * 2 + 1, 0.5);
        this.projector.unprojectVector(v, this.camera);
        ray = new THREE.Ray(this.camera.position, v.subSelf(this.camera.position).normalize());
        intersects = ray.intersectObjects(this.controller.objects);
        reset_col = function() {
          if (_this.current != null) {
            _this.current.material = _this.current.origMaterial;
            return _this.current = null;
          }
        };
        if (intersects != null) {
          if (intersects.length > 0) {
            if (intersects[0].object.name !== "workplane") {
              if (this.current !== intersects[0].object) {
                this.current = intersects[0].object;
                newMat = new THREE.MeshLambertMaterial({
                  color: 0xCC0000
                });
                this.current.origMaterial = this.current.material;
                return this.current.material = newMat;
              }
            } else {
              return reset_col();
            }
          } else {
            return reset_col();
          }
        } else {
          return reset_col();
        }
      };

      GlThreeView.prototype.modelChanged = function(model, value) {
        return this.fromCsg(this.model);
      };

      function GlThreeView(options, settings) {
        this.fromCsg = __bind(this.fromCsg, this);

        this.animate = __bind(this.animate, this);

        this.onRender = __bind(this.onRender, this);

        this.addCage = __bind(this.addCage, this);

        this.addPlane = __bind(this.addPlane, this);

        this.setupLights = __bind(this.setupLights, this);

        this.addObjs = __bind(this.addObjs, this);

        this.addObjs2 = __bind(this.addObjs2, this);

        this.modelChanged = __bind(this.modelChanged, this);

        this.selectObj = __bind(this.selectObj, this);

        this.mousedown = __bind(this.mousedown, this);

        this.mouseup = __bind(this.mouseup, this);

        this.dragstart = __bind(this.dragstart, this);

        this.mousewheel = __bind(this.mousewheel, this);

        this.rightclick = __bind(this.rightclick, this);

        var ASPECT, FAR, NEAR, viewAngle,
          _this = this;
        GlThreeView.__super__.constructor.call(this, options);
        settings = options.settings;
        this.bindTo(this.model, "change", this.modelChanged);
        this.dragging = false;
        this.width = 800;
        this.height = 600;
        this.viewAngle = 45;
        ASPECT = this.width / this.height;
        NEAR = 1;
        FAR = 10000;
        this.renderer = new THREE.WebGLRenderer({
          clearColor: 0xEEEEEE,
          clearAlpha: 1,
          antialias: true
        });
        this.renderer.clear();
        this.camera = new THREE.PerspectiveCamera(this.viewAngle, ASPECT, NEAR, FAR);
        this.camera.position.z = 300;
        this.camera.position.y = 150;
        this.camera.position.x = 150;
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.setupLights();
        if (settings) {
          console.log("we have settings");
          if (settings.get("showGrid")) {
            this.addPlane();
          }
          if (settings.get("showAxis")) {
            this.addAxes();
          }
        }
        this.renderer.setSize(this.width, this.height);
        this.controller = new THREE.Object3D();
        this.controller.setCurrent = function(current) {
          return _this.current = current;
        };
        this.controller.objects = this.scene.__objects;
        this.projector = new THREE.Projector();
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.autoRotate = false;
        viewAngle = 45;
        ASPECT = 800 / 600;
        NEAR = 1;
        FAR = 10000;
        this.overlayRenderer = new THREE.WebGLRenderer({
          clearColor: 0x000000,
          clearAlpha: 0,
          antialias: true
        });
        this.overlayCamera = new THREE.OrthographicCamera(-200, 200, 150, -150, NEAR, FAR);
        this.overlayCamera.position.z = 300;
        this.overlayCamera.position.y = 150;
        this.overlayCamera.position.x = 150;
        this.overlayscene = new THREE.Scene();
        this.overlayscene.add(this.overlayCamera);
        this.overlayControls = new THREE.OrbitControls(this.overlayCamera);
        this.overlayControls.autoRotate = false;
        this.xArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 100, 0xFF7700);
        this.yArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), 100, 0x77FF00);
        this.zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 100, 0x0077FF);
        this.overlayscene.add(this.xArrow);
        this.overlayscene.add(this.yArrow);
        this.overlayscene.add(this.zArrow);
      }

      GlThreeView.prototype.addObjs2 = function() {
        this.cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshBasicMaterial({
          color: 0x000000
        }));
        return this.scene.add(this.cube);
      };

      GlThreeView.prototype.addObjs = function() {
        var radius, rings, segments, sphere, sphereMaterial;
        sphereMaterial = new THREE.MeshLambertMaterial({
          color: 0xCC0000
        });
        radius = 50;
        segments = 16;
        rings = 16;
        sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
        sphere.name = "Shinyyy";
        return this.scene.add(sphere);
      };

      GlThreeView.prototype.setupLights = function() {
        var ambientLight, pointLight, spotLight;
        pointLight = new THREE.PointLight(0x333333, 5);
        pointLight.position.x = -2200;
        pointLight.position.y = -2200;
        pointLight.position.z = 3000;
        this.ambientColor = '0x253565';
        ambientLight = new THREE.AmbientLight(this.ambientColor);
        spotLight = new THREE.SpotLight(0xbbbbbb, 2);
        spotLight.position.x = 0;
        spotLight.position.y = 1000;
        spotLight.position.z = 0;
        this.scene.add(ambientLight);
        this.scene.add(pointLight);
        return this.scene.add(spotLight);
      };

      GlThreeView.prototype.addPlane = function() {
        var plane, planeGeo, planeMat;
        planeGeo = new THREE.PlaneGeometry(500, 500, 5, 5);
        planeMat = new THREE.MeshBasicMaterial({
          color: 0x808080,
          wireframe: true,
          shading: THREE.FlatShading
        });
        plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -30;
        plane.name = "workplane";
        return this.scene.add(plane);
      };

      GlThreeView.prototype.addAxes = function() {
        var axes;
        axes = new MyAxisHelper(200, 0x666666, 0x666666, 0x666666);
        return this.scene.add(axes);
      };

      GlThreeView.prototype.addCage = function() {
        var line, lineGeo, lineMat, v;
        v = function(x, y, z) {
          return new THREE.Vector3(x, y, z);
        };
        lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(v(-50, 0, 0), v(50, 0, 0), v(0, -50, 0), v(0, 50, 0), v(0, 0, -50), v(0, 0, 50), v(-50, 50, -50), v(50, 50, -50), v(-50, -50, -50), v(50, -50, -50), v(-50, 50, 50), v(50, 50, 50), v(-50, -50, 50), v(50, -50, 50), v(-50, 0, 50), v(50, 0, 50), v(-50, 0, -50), v(50, 0, -50), v(-50, 50, 0), v(50, 50, 0), v(-50, -50, 0), v(50, -50, 0), v(50, -50, -50), v(50, 50, -50), v(-50, -50, -50), v(-50, 50, -50), v(50, -50, 50), v(50, 50, 50), v(-50, -50, 50), v(-50, 50, 50), v(0, -50, 50), v(0, 50, 50), v(0, -50, -50), v(0, 50, -50), v(50, -50, 0), v(50, 50, 0), v(-50, -50, 0), v(-50, 50, 0), v(50, 50, -50), v(50, 50, 50), v(50, -50, -50), v(50, -50, 50), v(-50, 50, -50), v(-50, 50, 50), v(-50, -50, -50), v(-50, -50, 50), v(-50, 0, -50), v(-50, 0, 50), v(50, 0, -50), v(50, 0, 50), v(0, 50, -50), v(0, 50, 50), v(0, -50, -50), v(0, -50, 50));
        lineMat = new THREE.LineBasicMaterial({
          color: 0x808080,
          lineWidth: 1
        });
        line = new THREE.Line(lineGeo, lineMat);
        line.type = THREE.Lines;
        return this.scene.add(line);
      };

      GlThreeView.prototype.onRender = function() {
        var container, container2;
        container = $(this.ui.renderBlock);
        container.append(this.renderer.domElement);
        container2 = $(this.ui.overlayBlock);
        container2.append(this.overlayRenderer.domElement);
        return this.animate();
      };

      GlThreeView.prototype.animate = function() {
        var t;
        t = new Date().getTime();
        this.camera.lookAt(this.scene.position);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.overlayCamera.lookAt(this.overlayscene.position);
        this.overlayControls.update();
        this.overlayRenderer.render(this.overlayscene, this.overlayCamera);
        return requestAnimationFrame(this.animate);
      };

      GlThreeView.prototype.toCsgTest = function(mesh) {
        var csgResult;
        csgResult = THREE.CSG.toCSG(mesh);
        if (csgResult != null) {
          return console.log("CSG conversion result ok:");
        }
      };

      GlThreeView.prototype.fromCsg = function(csg) {
        var app, geom, mat, resultCSG, shine, spec;
        try {
          app = require('app');
          app.csgProcessor.setCoffeeSCad(this.model.get("content"));
          resultCSG = app.csgProcessor.csg;
          geom = THREE.CSG.fromCSG(resultCSG);
          mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
          });
          mat = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            lineWidth: 1
          });
          mat = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
          });
          shine = 1500;
          spec = 10000000000;
          mat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shading: THREE.SmoothShading,
            shininess: shine,
            specular: spec,
            metal: true,
            vertexColors: THREE.VertexColors
          });
          if (this.mesh != null) {
            this.scene.remove(this.mesh);
          }
          this.mesh = new THREE.Mesh(geom, mat);
          return this.scene.add(this.mesh);
        } catch (error) {
          return console.log("error " + error + " in from csg conversion");
        }
      };

      return GlThreeView;

    })(marionette.ItemView);
    return {
      GlThreeView: GlThreeView,
      GlViewSettings: GlViewSettings
    };
  });

}).call(this);
