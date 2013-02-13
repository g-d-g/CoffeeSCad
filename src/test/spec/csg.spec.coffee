define (require)->
  csg = require "modules/core/projects/csg/csg"
  CSGBase = csg.CSGBase
  CAGBase = csg.CAGBase
  Cube = csg.Cube
  Sphere = csg.Sphere
  Cylinder= csg.Cylinder
  Plane = csg.Plane
  quickHull2d = csg.quickHull2d
  Rectangle = csg.Rectangle
  Circle = csg.Circle
  
  
  describe "CSG transforms", ->
    it 'can translate a csg object', ->
      cube = new Cube(size:100)
      cube.translate([100,0,0])
      expect(cube.polygons[0].vertices[0].pos.x).toBe(100)
      
    it 'can rotate a csg object', ->
      cube = new Cube(size:100)
      cube.rotate([45,45,45])
      expect(cube.polygons[0].vertices[1].pos.x).toBe(85.35533905932736)
    
    it 'can scale a csg object', ->
      cube = new Cube(size:100)
      cube.scale([100,100,100])
      expect(cube.polygons[0].vertices[1].pos.z).toBe(10000)
  
  describe "CSG boolean operations", ->
    beforeEach -> 
      @addMatchers 
        toBeEqualToObject: (expected) -> 
          _.isEqual @actual, expected
      
    it 'can do unions between two 3d shapes' , ->
      cube = new Cube(size:100)
      cube2 = new Cube(size:100,center:[90,90,0])
      cube.union(cube2)
      expect(cube.polygons.length).toBe(14)
    
    it 'can do unions between multiple 3d shapes' , ->
      cube = new Cube(size:100)
      cube2 = new Cube(size:100,center:[90,90,0])
      cube3 = new Cube(size:100,center:[90,90,-90])
      cube.union([cube2,cube3])
      expect(cube.polygons.length).toBe(16)
      
    it 'can do substractions between 3d shapes' , ->
      cube = new Cube(size:100)
      cube2 = new Cube(size:100,center:[90,90,0])
      cube.subtract(cube2)
      expect(cube.polygons.length).toBe(10)
    
    it 'can do intersection between 3d shapes' , ->
      cube = new Cube(size:100)
      cube2 = new Cube(size:100,center:[90,90,0])
      cube.intersect(cube2)
      expect(cube.polygons.length).toBe(6)
    
    it 'can slice a csg object by a plane' , ->
      cube = new Cube(size:100)
      cube2 = new Cube(size:100,center:[90,90,0])
      plane = Plane.fromNormalAndPoint([0, 0, 1], [0, 0, 25])
      cube.cutByPlane(plane)
      expect(cube.polygons.length).toBe(6)
      
  describe "CSG 2d shapes manipulation", ->
    beforeEach -> 
      @addMatchers 
        toBeEqualToObject: (expected) -> 
          _.isEqual @actual, expected
          
    it 'can do unions between 2d shapes' , ->
      circle = new Circle(r:25,center:[0,0],$fn:10)
      rectangle = new Rectangle(size:20).translate([100,0,0])
      circle.union(rectangle)
      expect(circle.sides.length).toBe(14)
    
    it 'can do subtraction between 2d shapes' , ->
      circle = new Circle(r:25,center:[0,0],$fn:10)
      rectangle = new Rectangle(size:20).translate([100,0,0])
      circle.subtract(rectangle)
      expect(circle.sides.length).toBe(10)
    
    it 'can do intersections between 2d shapes' , ->
      circle = new Circle(r:25,center:[0,0],$fn:10)
      rectangle = new Rectangle(size:25)
      circle.intersect(rectangle)
      expect(circle.sides.length).toBe(4)
    
    it 'can extrude 2d shapes', ->
      circle = new Circle(r:10,center:[0,0],$fn:10)
      cylinder = circle.extrude(offset: [0, 0, 100],twist:180,slices:20)
      expect(cylinder.polygons.length).toBe(402)
    
    it 'can generate a convex hull around 2d shapes', ->
      circle = new Circle(r:25,center:[0,0],$fn:10).translate([0,-25,0])
      rectangle = new Rectangle(size:20).translate([100,0,0])
      hulled = quickHull2d(circle,rectangle)
      expect(hulled.sides.length).toBe(9)
