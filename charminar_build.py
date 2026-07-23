# ============================================================
# CHARMINAR - FreeCAD headless builder (fixed)
# Run: freecadcmd.exe charminar_build.py
# ============================================================

import FreeCAD, Part
from FreeCAD import Base
from math import cos, sin, pi, sqrt
import sys

doc = FreeCAD.newDocument("Charminar")

# Parameters
BASE_W, BASE_H = 60, 4
BLDG_W, BLDG_H = 52, 30
GALLERY_H = 10
ARCH_W, ARCH_H = 16, 24
ARCH_CUT = 14
MIN_R1, MIN_R2, MIN_H = 3.5, 2.0, 42
MIN_LEVELS = 3
DOME_R, DOME_H = 7, 9
S_DOME_R, S_DOME_H = 2.8, 4

def fuse(a, b):
    if a is None: return b
    if b is None: return a
    try:
        r = a.fuse(b)
        if r.isNull(): print("  WARN: fuse produced null"); return a
        return r
    except Exception as e:
        print(f"  WARN: fuse failed: {e}")
        return a

def cut(a, b):
    if a is None or b is None: return a
    try:
        r = a.cut(b)
        if r.isNull(): print("  WARN: cut produced null"); return a
        return r
    except Exception as e:
        print(f"  WARN: cut failed: {e}")
        return a

def onion_dome(r, h, pos):
    dome = Part.makeSphere(r, pos + Base.Vector(0, 0, h * 0.35))
    mat = FreeCAD.Matrix()
    mat.scale(Base.Vector(1, 1, h / r))
    dome = dome.transformShape(mat)
    spire = Part.makeCone(r * 0.3, 0.08, h * 0.55, pos + Base.Vector(0, 0, h * 0.65))
    return dome.fuse(spire)

def pointed_arch_solid(w, h, depth):
    # Build pointed arch as a solid block with arch cutout
    block = Part.makeBox(w + 4, depth, h, Base.Vector(-(w+4)/2, -depth/2, 0))
    # Cut rectangular lower portion
    rect_cut = Part.makeBox(w, depth + 0.2, h * 0.5, Base.Vector(-w/2, -depth/2 - 0.1, 0))
    block = block.cut(rect_cut)
    # Cut pointed upper portion using a cone-like approach
    # Use an extruded triangle/arc for the pointed top
    top_h = h * 0.5
    r = (w*w/4 + top_h*top_h) / (2*top_h)
    cy = top_h - r
    cyl = Part.makeCylinder(r, depth + 0.2, Base.Vector(0, -depth/2 - 0.1, cy))
    block = block.cut(cyl)
    return block

# ====== 1. BASE PLINTH ======
print("[1/8] Base plinth...")
plinth = Part.makeBox(BASE_W + 4, BASE_W + 4, BASE_H, 
                       Base.Vector(-(BASE_W+4)/2, -(BASE_W+4)/2, -BLDG_H/2 - BASE_H))
for a in range(4):
    ang = a * pi / 2
    for s in range(5):
        step = Part.makeBox(BASE_W + 2, 1.4, 1,
                           Base.Vector(-(BASE_W+2)/2, BASE_W/2 + 1 + s*1.4, -BLDG_H/2 - BASE_H + s*1))
        step.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        plinth = plinth.fuse(step)
print(f"  Plinth: {len(plinth.Faces)} faces")

# ====== 2. MAIN BUILDING ======
print("[2/8] Main structure...")
main = Part.makeBox(BLDG_W, BLDG_W, BLDG_H, Base.Vector(-BLDG_W/2, -BLDG_W/2, -BLDG_H/2))

# Grand arch cutter: cylinder top + rectangular bottom
def make_arch_cutter(w, h, depth):
    cutters = []
    # Rectangular bottom half
    rect = Part.makeBox(w, depth + 0.2, h * 0.45, 
                        Base.Vector(-w/2, -(depth+0.2)/2, 0))
    cutters.append(rect)
    # Cylinder for pointed top
    r = w/2
    cyl = Part.makeCylinder(r, depth + 0.2, 
                            Base.Vector(0, -(depth+0.2)/2, h * 0.25))
    cutters.append(cyl)
    result = cutters[0]
    for c in cutters[1:]:
        result = result.fuse(c)
    return result

# Cut 4 grand arches
arch_cutter = make_arch_cutter(ARCH_W, ARCH_H, ARCH_CUT)
for a in range(4):
    ang = a * pi / 2
    cutter = arch_cutter.copy()
    cutter.translate(Base.Vector(0, BLDG_W/2 - ARCH_CUT/2, BLDG_H/2 - ARCH_H - 2))
    cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
    cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
    main = main.cut(cutter)

# Cut 4 upper arches
s_cutter = make_arch_cutter(ARCH_W * 0.55, GALLERY_H * 0.85, ARCH_CUT * 0.6)
for a in range(4):
    ang = a * pi / 2
    cutter = s_cutter.copy()
    cutter.translate(Base.Vector(0, BLDG_W/2 - ARCH_CUT*0.3, BLDG_H/2 - GALLERY_H + 1))
    cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
    cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
    main = main.cut(cutter)

# Cut side windows
w_cutter = make_arch_cutter(ARCH_W * 0.28, GALLERY_H * 0.6, ARCH_CUT * 0.35)
for a in range(4):
    ang = a * pi / 2
    for x in [-1, 1]:
        cutter = w_cutter.copy()
        cutter.translate(Base.Vector(x * BLDG_W * 0.27, BLDG_W/2 - ARCH_CUT*0.175, BLDG_H/2 - GALLERY_H + 1))
        cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 1, 0), 90)
        cutter.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        main = main.cut(cutter)
print(f"  Building: {len(main.Faces)} faces")

# ====== 3. PARAPET ======
print("[3/8] Parapet...")
para = Part.makeBox(BLDG_W + 0.5, BLDG_W + 0.5, 2.5,
                    Base.Vector(-(BLDG_W+0.5)/2, -(BLDG_W+0.5)/2, BLDG_H/2 - 1.25))
para_inner = Part.makeBox(BLDG_W - 2, BLDG_W - 2, 3,
                          Base.Vector(-(BLDG_W-2)/2, -(BLDG_W-2)/2, BLDG_H/2 - 1.5))
para = para.cut(para_inner)
for a in range(4):
    ang = a * pi / 2
    for ix in range(int(-BLDG_W/2 + 3), int(BLDG_W/2 - 3), 5):
        batt = Part.makeBox(2.2, 1, 2.5, Base.Vector(ix - 1.1, BLDG_W/2 - 0.5, BLDG_H/2 + 0.5))
        batt.rotate(Base.Vector(0, 0, 0), Base.Vector(0, 0, 1), ang * 180/pi)
        para = para.fuse(batt)
print(f"  Parapet: {len(para.Faces)} faces")

# ====== 4. MINARETS ======
print("[4/8] Minarets...")
all_minarets = None
for a in range(4):
    ang_rad = a * pi / 2 + pi / 4
    cx = (BLDG_W/2 - MIN_R1 - 2.5) * cos(ang_rad)
    cy = (BLDG_W/2 - MIN_R1 - 2.5) * sin(ang_rad)
    bz = BLDG_H/2
    shaft = Part.makeCone(MIN_R1, MIN_R2, MIN_H, Base.Vector(cx, cy, bz))
    for i in range(1, MIN_LEVELS + 1):
        z = bz + (MIN_H / (MIN_LEVELS + 1)) * i
        r = MIN_R1 - (MIN_R1 - MIN_R2) * ((z - bz) / MIN_H)
        ring = Part.makeCylinder(r + 1.8, 1.2, Base.Vector(cx, cy, z - 0.6))
        ring_inner = Part.makeCylinder(r - 0.8, 1.4, Base.Vector(cx, cy, z - 0.7))
        shaft = shaft.fuse(ring.cut(ring_inner))
    shaft = shaft.fuse(onion_dome(S_DOME_R, S_DOME_H, Base.Vector(cx, cy, bz + MIN_H)))
    all_minarets = shaft if all_minarets is None else all_minarets.fuse(shaft)
print(f"  Minarets: {len(all_minarets.Faces)} faces")

# ====== 5. CENTRAL DOME ======
print("[5/8] Central dome...")
cdome = onion_dome(DOME_R, DOME_H, Base.Vector(0, 0, BLDG_H/2 + 2.5))
print(f"  Dome: {len(cdome.Faces)} faces")

# ====== 6. CHHATRIS ======
print("[6/8] Chhatris...")
chhatris = None
for a in range(4):
    ang_rad = a * pi / 2 + pi / 4
    cx = (BLDG_W/2 - 8) * cos(ang_rad)
    cy = (BLDG_W/2 - 8) * sin(ang_rad)
    bz = BLDG_H/2 + 2.5
    for j in range(6):
        pa = j * pi / 3
        px, py = cx + 1.6*cos(pa), cy + 1.6*sin(pa)
        pillar = Part.makeCylinder(0.4, 2.5, Base.Vector(px, py, bz))
        chhatris = pillar if chhatris is None else chhatris.fuse(pillar)
    chhatris = chhatris.fuse(onion_dome(2.5, 3.2, Base.Vector(cx, cy, bz + 2.5)))
print(f"  Chhatris: {len(chhatris.Faces)} faces")

# ====== 7. STRING COURSES ======
print("[7/8] String courses...")
courses = None
for z in [BLDG_H/2 - GALLERY_H, -BLDG_H/2 + 2, BLDG_H/2 - GALLERY_H - 4]:
    outer = Part.makeBox(BLDG_W + 2.4, BLDG_W + 2.4, 0.8,
                         Base.Vector(-(BLDG_W+2.4)/2, -(BLDG_W+2.4)/2, z - 0.4))
    inner = Part.makeBox(BLDG_W - 1.5, BLDG_W - 1.5, 1,
                         Base.Vector(-(BLDG_W-1.5)/2, -(BLDG_W-1.5)/2, z - 0.5))
    courses = (outer.cut(inner)) if courses is None else courses.fuse(outer.cut(inner))

# ====== 8. FINAL ASSEMBLY ======
print("[8/8] Final assembly...")
final = plinth
final = final.fuse(main)
final = final.fuse(para)
final = final.fuse(all_minarets)
final = final.fuse(cdome)
final = final.fuse(chhatris)
final = final.fuse(courses)

print(f"\nFinal model: {len(final.Vertexes)} vertices, {len(final.Faces)} faces, {len(final.Shells)} shells")

obj = doc.addObject("Part::Feature", "Charminar")
obj.Shape = final
obj.Label = "Charminar"
doc.recompute()

outpath = "C:/Users/venka/OneDrive/Documents/Default Project/charminar.FCStd"
doc.saveAs(outpath)
print(f"\nSaved to: {outpath}")
print("DONE - Open in FreeCAD GUI for rendering")
