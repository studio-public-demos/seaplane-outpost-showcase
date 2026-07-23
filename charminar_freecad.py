# ============================================================
# CHARMINAR - FreeCAD Macro
# Photorealistic 3D model using Part workbench CSG
# Run: freecad.exe charminar_freecad.py
# ============================================================

import FreeCAD, Part, Mesh
from FreeCAD import Base
from math import cos, sin, pi

doc = FreeCAD.newDocument("Charminar")
Gui.activeDocument().activeView().viewAxonometric()
Gui.activeDocument().activeView().fitAll()

# ---------- Colors ----------
SANDSTONE  = (0.94, 0.80, 0.62, 1.0)   # Warm sandstone
DARK_STONE = (0.75, 0.60, 0.45, 1.0)   # Darker accent
WHITE      = (0.98, 0.97, 0.93, 1.0)   # White marble dome
GRAY       = (0.55, 0.55, 0.55, 1.0)   # Metal finial
DARK_GRAY  = (0.35, 0.33, 0.30, 1.0)   # Shadow details
GOLD       = (0.85, 0.70, 0.30, 1.0)   # Gold accents

def set_color(obj, color, transparency=0):
    """Set shape color for a Part object"""
    vo = Gui.activeDocument().getObject(obj.Name)
    if vo:
        vo.ShapeColor = color[:3]
        vo.Transparency = transparency * 100

def set_view_mode(obj, mode="Shaded"):
    vo = Gui.activeDocument().getObject(obj.Name)
    if vo:
        vo.DisplayMode = mode

# ---------- Parameters ----------
BASE_W     = 60
BASE_H     = 4
BLDG_W     = 52
BLDG_H     = 30
GALLERY_H  = 10
ARCH_W     = 16
ARCH_H     = 24
ARCH_CUT   = 14

MIN_BASE_R = 3.5
MIN_TOP_R  = 2.0
MIN_H      = 42
MIN_LEVELS = 3

DOME_R     = 7
DOME_H     = 9

S_DOME_R   = 2.8
S_DOME_H   = 4

# ---------- Helper: Islamic pointed arch ----------
def make_arch_profile(w, h):
    # Creates a face for the pointed arch
    from math import sqrt
    r = (w*w/4 + h*h) / (2*h)  # Radius of the arc
    center_y = h - r
    
    # Arc points
    pts = []
    n = 30
    angles = []
    for i in range(n+1):
        ang = pi/2 - (pi/2 * i / n)
        x = r * cos(ang)
        y = center_y + r * sin(ang)
        if y >= 0:
            pts.append(Base.Vector(x, y, 0))
    
    # Mirrored left side (reversed)
    left = [Base.Vector(-p.x, p.y, 0) for p in reversed(pts[:-1])]
    
    # Full profile
    all_pts = left + pts
    # Close polygon at bottom
    all_pts.append(Base.Vector(w/2, 0, 0))
    all_pts.insert(0, Base.Vector(-w/2, 0, 0))
    
    # Create polygon and face
    poly = Part.makePolygon(all_pts)
    wire = Part.Wire(poly)
    face = Part.Face(wire)
    return face

def make_onion_dome(r, h):
    """Onion-shaped dome: sphere + spire"""
    dome = doc.addObject("Part::Sphere", "dome_sphere")
    dome.Radius = r
    dome.Angle1 = -90
    dome.Angle2 = 90
    dome.Angle3 = 360
    dome.recompute()
    # Scale vertically
    mat = FreeCAD.Matrix()
    mat.scale(Base.Vector(1, 1, h/r))
    shaped = dome.Shape.copy()
    shaped.transformShape(mat)
    
    # Spire
    spire = Part.makeCone(r * 0.3, 0.08, h * 0.55, Base.Vector(0, 0, h * 0.65))
    
    result = shaped.fuse(spire)
    return result

# ---------- Base Plinth ----------
print("Building base plinth...")

# Main platform
platform = Part.makeBox(BASE_W + 4, BASE_W + 4, BASE_H, Base.Vector(-(BASE_W+4)/2, -(BASE_W+4)/2, -BLDG_H/2 - BASE_H))
# Steps
for a in range(4):
    ang = a * pi / 2
    for s in range(5):
        sy = BASE_W/2 + 1 + s * 1.4
        sz = -BLDG_H/2 - BASE_H + s * 1
        step = Part.makeBox(BASE_W + 2, 1.4, 1, Base.Vector(-(BASE_W+2)/2, sy, sz))
        step.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        platform = platform.fuse(step)

# ---------- Main Building ----------
print("Building main structure...")

main_block = Part.makeBox(BLDG_W, BLDG_W, BLDG_H, Base.Vector(-BLDG_W/2, -BLDG_W/2, -BLDG_H/2))

# Cut grand arches
arch_face = make_arch_profile(ARCH_W, ARCH_H)
for a in range(4):
    ang = a * pi / 2
    arch_3d = arch_face.extrude(Base.Vector(0, 0, ARCH_CUT))
    # Position on the face
    arch_3d.translate(Base.Vector(0, BLDG_W/2 - ARCH_CUT/2, BLDG_H/2 - ARCH_H - 2))
    arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
    arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
    main_block = main_block.cut(arch_3d)

# Cut upper gallery arches
small_arch_face = make_arch_profile(ARCH_W * 0.55, GALLERY_H * 0.85)
for a in range(4):
    ang = a * pi / 2
    arch_3d = small_arch_face.extrude(Base.Vector(0, 0, ARCH_CUT * 0.6))
    arch_3d.translate(Base.Vector(0, BLDG_W/2 - ARCH_CUT*0.3, BLDG_H/2 - GALLERY_H + 1))
    arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
    arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
    main_block = main_block.cut(arch_3d)

# Cut side windows
win_face = make_arch_profile(ARCH_W * 0.28, GALLERY_H * 0.6)
for a in range(4):
    ang = a * pi / 2
    for x in [-1, 1]:
        arch_3d = win_face.extrude(Base.Vector(0, 0, ARCH_CUT * 0.35))
        arch_3d.translate(Base.Vector(x * BLDG_W * 0.27, BLDG_W/2 - ARCH_CUT*0.175, BLDG_H/2 - GALLERY_H + 1))
        arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
        arch_3d.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        main_block = main_block.cut(arch_3d)

# ---------- Parapet ----------
print("Building parapet...")
parapet_outer = Part.makeBox(BLDG_W + 0.5, BLDG_W + 0.5, 2.5, Base.Vector(-(BLDG_W+0.5)/2, -(BLDG_W+0.5)/2, BLDG_H/2 - 1.25))
parapet_inner = Part.makeBox(BLDG_W - 2, BLDG_W - 2, 3, Base.Vector(-(BLDG_W-2)/2, -(BLDG_W-2)/2, BLDG_H/2 - 1.5))
parapet_solid = parapet_outer.cut(parapet_inner)

# Crenellations
for a in range(4):
    ang = a * pi / 2
    for x in range(int(-BLDG_W/2 + 3), int(BLDG_W/2 - 3), 5):
        batt = Part.makeBox(2.2, 1, 2.5, Base.Vector(x - 1.1, BLDG_W/2 - 0.5, BLDG_H/2 + 0.5))
        batt.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        parapet_solid = parapet_solid.fuse(batt)

# ---------- Minarets ----------
print("Building minarets...")

minaret_shape = None

for a in range(4):
    ang_rad = a * pi / 2 + pi / 4
    cx = (BLDG_W/2 - MIN_BASE_R - 2.5) * cos(ang_rad)
    cy = (BLDG_W/2 - MIN_BASE_R - 2.5) * sin(ang_rad)
    base_z = BLDG_H/2
    
    # Tapered shaft
    shaft = Part.makeCone(MIN_BASE_R, MIN_TOP_R, MIN_H, Base.Vector(cx, cy, base_z))
    
    # Balcony rings
    for i in range(1, MIN_LEVELS + 1):
        z = base_z + (MIN_H / (MIN_LEVELS + 1)) * i
        r = MIN_BASE_R - (MIN_BASE_R - MIN_TOP_R) * ((z - base_z) / MIN_H)
        ring = Part.makeCylinder(r + 1.8, 1.2, Base.Vector(cx, cy, z - 0.6))
        inner = Part.makeCylinder(r - 0.8, 1.4, Base.Vector(cx, cy, z - 0.7))
        ring = ring.cut(inner)
        shaft = shaft.fuse(ring)
    
    # Top dome
    min_dome = make_onion_dome(S_DOME_R, S_DOME_H)
    min_dome.translate(Base.Vector(cx, cy, base_z + MIN_H))
    shaft = shaft.fuse(min_dome)
    
    if minaret_shape is None:
        minaret_shape = shaft
    else:
        minaret_shape = minaret_shape.fuse(shaft)

# ---------- Central Dome ----------
print("Building central dome...")
central_dome = make_onion_dome(DOME_R, DOME_H)
central_dome.translate(Base.Vector(0, 0, BLDG_H/2 + 2.5))

# ---------- Chhatris (corner pavilions) ----------
print("Building chhatris...")
chhatris = None
for a in range(4):
    ang_rad = a * pi / 2 + pi / 4
    cx = (BLDG_W/2 - 8) * cos(ang_rad)
    cy = (BLDG_W/2 - 8) * sin(ang_rad)
    base_z = BLDG_H/2
    
    # Pillars
    for j in range(6):
        p_ang = j * pi / 3
        px = cx + 1.6 * cos(p_ang)
        py = cy + 1.6 * sin(p_ang)
        pillar = Part.makeCylinder(0.4, 2.5, Base.Vector(px, py, base_z))
        if chhatris is None:
            chhatris = pillar
        else:
            chhatris = chhatris.fuse(pillar)
    
    # Dome
    cd = make_onion_dome(2.5, 4)
    cd.translate(Base.Vector(cx, cy, base_z + 2.5))
    chhatris = chhatris.fuse(cd)

# ---------- Assemble ----------
print("Assembling final model...")

final = platform
final = final.fuse(main_block)
final = final.fuse(parapet_solid)
final = final.fuse(minaret_shape)
final = final.fuse(central_dome)
final = final.fuse(chhatris)

# Add string courses (decorative bands)
for z_offset in [BLDG_H/2 - GALLERY_H, -BLDG_H/2 + 2, BLDG_H/2 - GALLERY_H - 4]:
    outer = Part.makeBox(BLDG_W + 2.4, BLDG_W + 2.4, 0.8, 
                         Base.Vector(-(BLDG_W+2.4)/2, -(BLDG_W+2.4)/2, z_offset - 0.4))
    inner = Part.makeBox(BLDG_W - 1.5, BLDG_W - 1.5, 1, 
                         Base.Vector(-(BLDG_W-1.5)/2, -(BLDG_W-1.5)/2, z_offset - 0.5))
    course = outer.cut(inner)
    final = final.fuse(course)

# ---------- Add to Document ----------
print("Adding to FreeCAD document...")
obj = doc.addObject("Part::Feature", "Charminar")
obj.Shape = final
obj.Label = "Charminar"

# Set material appearance
vo = Gui.activeDocument().getObject(obj.Name)
if vo:
    vo.ShapeColor = SANDSTONE[:3]
    vo.Transparency = 0
    vo.DisplayMode = "Shaded"
    vo.ShapeMaterial.DiffuseColor = SANDSTONE[:3]
    vo.ShapeMaterial.AmbientColor = (0.3, 0.3, 0.3)
    vo.ShapeMaterial.SpecularColor = (0.1, 0.1, 0.1)
    vo.ShapeMaterial.Shininess = 0.2
    vo.ShapeMaterial.EmissiveColor = (0.0, 0.0, 0.0)

# ---------- Set up view ----------
Gui.activeDocument().activeView().viewAxonometric()
Gui.activeDocument().activeView().fitAll()
Gui.activeDocument().activeView().setCameraType("Perspective")

# Lighting setup
view = Gui.activeDocument().activeView()
if hasattr(view, 'getViewer'):
    viewer = view.getViewer()
    if viewer:
        # Add directional lights
        viewer.setBackgroundColor((0.53, 0.81, 0.98))  # Sky blue
        viewer.setLighting(True)

doc.recompute()

print("============================================")
print(" CHARMINAR MODEL COMPLETE")
print(" Open FreeCAD GUI to view and render")
print(" Use View > Appearance to adjust materials")
print(" Use Tools > Save picture for screenshot")
print("============================================")
