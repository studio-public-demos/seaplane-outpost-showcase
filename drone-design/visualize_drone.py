"""
NebulaCam X1 - Drone Visualization Script
Generates preview images of the 3D drone model
Made with Nebula Cloud Studio
"""

import trimesh
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import os

def load_and_visualize():
    """Load the STL model and create multi-view visualization"""
    
    # Load the model
    stl_path = os.path.join(os.path.dirname(__file__), 'output', 'NebulaCam_X1.stl')
    
    if not os.path.exists(stl_path):
        print(f"Model not found at {stl_path}")
        return
    
    mesh = trimesh.load(stl_path)
    
    print(f"Loaded model: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
    
    # Create figure with multiple views
    fig = plt.figure(figsize=(16, 12))
    fig.patch.set_facecolor('#1a1a2e')
    
    # View configurations: (title, elevation, azimuth)
    views = [
        ("Isometric View", 30, 45),
        ("Front View", 0, 0),
        ("Top View", 90, 0),
        ("Side View", 0, 90),
    ]
    
    for idx, (title, elev, azim) in enumerate(views, 1):
        ax = fig.add_subplot(2, 2, idx, projection='3d')
        ax.set_facecolor('#16213e')
        
        # Get vertices and faces
        vertices = mesh.vertices
        faces = mesh.faces
        
        # Create polygon collection
        polygons = []
        face_colors_list = []
        
        for face in faces:
            triangle = vertices[face]
            polygons.append(triangle)
            # Assign colors based on face position for visual interest
            center_y = np.mean(triangle[:, 1])
            center_z = np.mean(triangle[:, 2])
            
            if center_z > 0.03:  # Top/propellers area
                face_colors_list.append((0.86, 0.24, 0.12, 0.9))  # Orange
            elif center_z < -0.03:  # Camera/gimbal
                face_colors_list.append((0.12, 0.12, 0.14, 0.9))  # Black
            elif abs(center_y) > 0.04:  # Arms
                face_colors_list.append((0.24, 0.24, 0.26, 0.9))  # Dark gray
            else:
                face_colors_list.append((0.71, 0.71, 0.73, 0.9))  # Light gray
        
        poly = Poly3DCollection(polygons, alpha=0.85)
        poly.set_facecolor(face_colors_list)
        poly.set_edgecolor('#333333')
        poly.set_linewidth(0.1)
        ax.add_collection3d(poly)
        
        # Set axis limits
        ax.set_xlim(-0.15, 0.15)
        ax.set_ylim(-0.15, 0.15)
        ax.set_zlim(-0.06, 0.06)
        
        # Set viewing angle
        ax.view_init(elev=elev, azim=azim)
        
        # Style
        ax.set_title(title, color='white', fontsize=12, fontweight='bold', pad=10)
        ax.xaxis.pane.fill = False
        ax.yaxis.pane.fill = False
        ax.zaxis.pane.fill = False
        ax.xaxis.pane.set_edgecolor('#333333')
        ax.yaxis.pane.set_edgecolor('#333333')
        ax.zaxis.pane.set_edgecolor('#333333')
        ax.tick_params(colors='#666666', labelsize=7)
        ax.set_xlabel('X (m)', color='#888888', fontsize=8)
        ax.set_ylabel('Y (m)', color='#888888', fontsize=8)
        ax.set_zlabel('Z (m)', color='#888888', fontsize=8)
    
    # Main title
    fig.suptitle('NebulaCam X1 - Commercial Drone Design\nInspired by DJI Lito Series', 
                 color='white', fontsize=16, fontweight='bold', y=0.98)
    
    # Footer
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', 
             ha='right', va='bottom', fontsize=7, alpha=0.5, color='white')
    
    plt.tight_layout(rect=[0, 0.02, 1, 0.95])
    
    # Save
    output_path = os.path.join(os.path.dirname(__file__), 'output', 'NebulaCam_X1_Visualization.png')
    plt.savefig(output_path, dpi=200, bbox_inches='tight', 
                facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    
    print(f"Visualization saved: {output_path}")
    return output_path


if __name__ == "__main__":
    load_and_visualize()
