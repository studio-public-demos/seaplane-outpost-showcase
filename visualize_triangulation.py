import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np

def plot_triangulation():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # The point in 3D space we are observing
    target_point = np.array([0, 0, 5])
    
    # Camera positions (different angles around the object)
    cameras = [
        np.array([-5, -5, 2]),
        np.array([5, -5, 2]),
        np.array([0, 5, 2])
    ]

    # Plot the target point
    ax.scatter(target_point[0], target_point[1], target_point[2], color='red', s=100, label='Target Point')

    # Plot camera positions and rays
    for i, cam in enumerate(cameras):
        # Plot camera
        ax.scatter(cam[0], cam[1], cam[2], color='blue', s=50, label=f'Camera {i+1}')
        
        # Plot rays (line from camera to target)
        ax.plot([cam[0], target_point[0]], 
                [cam[1], target_point[1]], 
                [cam[2], target_point[2]], 
                color='gray', linestyle='--')

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title('Photogrammetry: Principles of Triangulation')
    ax.legend()
    
    print("Close the plot window to finish.")
    plt.show()

if __name__ == "__main__":
    plot_triangulation()
