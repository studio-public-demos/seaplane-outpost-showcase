# ============================================================
# CHARMINAR - FreeCAD Materials & Rendering Setup
# Apply materials, colors, and lighting
# ============================================================

import FreeCAD, FreeCADGui
from FreeCAD import Base
import Part

doc = FreeCAD.ActiveDocument
if not doc:
    doc = FreeCAD.open("C:/Users/venka/OneDrive/Documents/Default Project/charminar.FCStd")

obj = doc.getObject("Charminar")
if not obj:
    print("ERROR: Charminar object not found")
else:
    vo = FreeCADGui.ActiveDocument.getObject(obj.Name)
    
    # Sandstone material
    vo.ShapeColor = (0.94, 0.80, 0.62)
    vo.Transparency = 0
    vo.DisplayMode = "Shaded"
    
    # Material properties for rendering
    vo.ShapeMaterial.DiffuseColor = (0.94, 0.80, 0.62, 0.0)
    vo.ShapeMaterial.AmbientColor = (0.35, 0.30, 0.25, 0.0)
    vo.ShapeMaterial.SpecularColor = (0.15, 0.12, 0.08, 0.0)
    vo.ShapeMaterial.EmissiveColor = (0.0, 0.0, 0.0, 0.0)
    vo.ShapeMaterial.Shininess = 0.15
    vo.ShapeMaterial.Transparency = 0.0

    # Set view
    view = FreeCADGui.ActiveDocument.ActiveView
    view.viewAxonometric()
    view.fitAll()
    view.setCameraType("Perspective")
    
    # Background gradient
    from PySide import QtGui
    view.setBackgroundColor(QtGui.QColor(135, 206, 235))  # Sky blue
    
    print("Materials applied. Charminar ready for rendering.")
    print("Use Tools > Save picture... to export a render")
