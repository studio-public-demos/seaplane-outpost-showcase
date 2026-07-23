"""
Commercial Drone Design - Inspired by DJI Lito Series
Aerial Photography/Videography Platform
Made with Nebula Cloud Studio
"""

import trimesh
import numpy as np
from trimesh.creation import cylinder, box
import os

class DroneDesign:
    """Parametric commercial drone design for aerial photography"""
    
    def __init__(self):
        # Design specifications (inspired by DJI Lito series)
        self.specs = {
            'name': 'NebulaCam X1',
            'category': 'Commercial Aerial Photography Drone',
            'target_weight': 245,  # grams (under 249g regulatory threshold)
            'max_takeoff_weight': 350,  # grams (with payload)
            'flight_time': 38,  # minutes
            'max_speed': 15.7,  # m/s (56.5 km/h)
            'wind_resistance': 12,  # m/s
            'operating_temp': [-10, 40],  # Celsius
            'camera': {
                'sensor': '1/1.3" CMOS',
                'resolution': '48MP',
                'video': '4K/60fps',
                'aperture': 'f/1.7',
                'gimbal': '3-axis',
                'dynamic_range': '14 stops'
            },
            'obstacle_sensing': {
                'type': 'Omnidirectional',
                'range': '0.5-36m',
                'lidar': 'Forward-facing',
                'cameras': 6
            },
            'battery': {
                'type': 'LiPo 2S',
                'capacity': 3500,  # mAh
                'voltage': 7.6,  # V
                'weight': 85  # grams
            },
            'transmission': {
                'type': 'O4',
                'max_range': 20,  # km
                'frequency': '2.4/5.8 GHz'
            },
            'dimensions': {
                'folded': [144, 94, 62],  # mm
                'unfolded': [183, 251, 79]  # mm (without props)
            }
        }
        
        # Color scheme
        self.colors = {
            'body': [180, 180, 185, 255],      # Light gray
            'arms': [60, 60, 65, 255],          # Dark gray
            'propellers': [220, 60, 30, 255],   # Orange tips
            'camera': [30, 30, 35, 255],        # Black
            'sensors': [20, 20, 25, 255],       # Dark
            'battery': [100, 100, 105, 255],    # Medium gray
            'landing_gear': [80, 80, 85, 255]   # Gray
        }
    
    def create_main_body(self):
        """Create the main fuselage/body of the drone"""
        # Main body - rounded rectangular shape
        # Dimensions: 144mm x 94mm x 45mm (scaled to meters: 0.144 x 0.094 x 0.045)
        
        # Create main body using boxes with rounded edges approximation
        body_main = box(extents=[0.144, 0.094, 0.035])
        body_main.apply_translation([0, 0, 0.02])
        
        # Top cover (slightly curved appearance)
        body_top = box(extents=[0.140, 0.090, 0.008])
        body_top.apply_translation([0, 0, 0.04])
        
        # Bottom plate with sensor windows
        body_bottom = box(extents=[0.138, 0.088, 0.005])
        body_bottom.apply_translation([0, 0, 0.003])
        
        # Battery compartment area (rear section)
        battery_slot = box(extents=[0.060, 0.080, 0.030])
        battery_slot.apply_translation([-0.035, 0, 0.02])
        
        # Combine body parts
        body = trimesh.util.concatenate([body_main, body_top, body_bottom])
        
        # Apply color
        body.visual.face_colors = self.colors['body']
        
        return body
    
    def create_foldable_arm(self, angle_deg, is_front=True):
        """Create a single foldable arm with motor mount"""
        angle_rad = np.radians(angle_deg)
        
        # Arm length and dimensions
        arm_length = 0.085  # 85mm from body to motor
        arm_width = 0.012
        arm_height = 0.008
        
        # Create arm
        arm = box(extents=[arm_length, arm_width, arm_height])
        
        # Calculate position (offset from center)
        offset_x = 0.065 * np.cos(angle_rad)
        offset_y = 0.065 * np.sin(angle_rad)
        
        # Rotate arm to point outward
        rotation = trimesh.transformations.rotation_matrix(
            angle_rad, [0, 0, 1], point=[0, 0, 0.02]
        )
        
        arm.apply_transform(rotation)
        arm.apply_translation([offset_x, offset_y, 0.02])
        
        arm.visual.face_colors = self.colors['arms']
        
        return arm
    
    def create_motor_mount(self, angle_deg):
        """Create motor mount at arm end"""
        angle_rad = np.radians(angle_deg)
        
        # Motor position (end of arm)
        motor_distance = 0.108  # 108mm from center
        motor_x = motor_distance * np.cos(angle_rad)
        motor_y = motor_distance * np.sin(angle_rad)
        
        # Motor housing (cylinder)
        motor = cylinder(radius=0.015, height=0.012)
        motor.apply_translation([motor_x, motor_y, 0.028])
        
        motor.visual.face_colors = self.colors['arms']
        
        return motor
    
    def create_propeller(self, angle_deg):
        """Create propeller assembly"""
        angle_rad = np.radians(angle_deg)
        
        # Propeller position
        prop_distance = 0.108
        prop_x = prop_distance * np.cos(angle_rad)
        prop_y = prop_distance * np.sin(angle_rad)
        
        # Propeller blades (two blades)
        blade1 = box(extents=[0.065, 0.003, 0.001])
        blade2 = box(extents=[0.003, 0.065, 0.001])
        
        blade1.apply_translation([prop_x, prop_y, 0.036])
        blade2.apply_translation([prop_x, prop_y, 0.036])
        
        # Color with orange tips
        blade1.visual.face_colors = self.colors['propellers']
        blade2.visual.face_colors = self.colors['propellers']
        
        return trimesh.util.concatenate([blade1, blade2])
    
    def create_camera_gimbal(self):
        """Create 3-axis gimbal camera assembly"""
        # Gimbal mount (underside of body)
        gimbal_mount = cylinder(radius=0.018, height=0.010)
        gimbal_mount.apply_translation([0.045, 0, -0.002])
        
        # Gimbal arm
        gimbal_arm = box(extents=[0.008, 0.008, 0.025])
        gimbal_arm.apply_translation([0.045, 0, -0.018])
        
        # Camera housing
        camera_body = box(extents=[0.032, 0.028, 0.022])
        camera_body.apply_translation([0.045, 0, -0.035])
        
        # Lens
        lens = cylinder(radius=0.010, height=0.008)
        lens_rot = trimesh.transformations.rotation_matrix(np.pi/2, [1, 0, 0], point=[0.045, 0, -0.042])
        lens.apply_transform(lens_rot)
        
        # Sensor window (front face)
        sensor_window = box(extents=[0.020, 0.018, 0.002])
        sensor_window.apply_translation([0.045, 0, -0.035])
        
        gimbal = trimesh.util.concatenate([gimbal_mount, gimbal_arm, camera_body, lens, sensor_window])
        
        gimbal.visual.face_colors = self.colors['camera']
        
        return gimbal
    
    def create_obstacle_sensors(self):
        """Create omnidirectional obstacle sensing system"""
        sensors = []
        
        # Sensor positions (6 directions: front, back, left, right, top, bottom)
        sensor_positions = [
            [0.072, 0, 0.03],      # Front
            [-0.072, 0, 0.03],     # Back
            [0, 0.047, 0.03],      # Right
            [0, -0.047, 0.03],     # Left
            [0, 0, 0.048],         # Top
            [0, 0, -0.002]         # Bottom
        ]
        
        # Forward LiDAR sensor (larger)
        lidar = cylinder(radius=0.008, height=0.005)
        lidar.apply_translation([0.072, 0, 0.03])
        sensors.append(lidar)
        
        # Vision sensors (smaller)
        for i, pos in enumerate(sensor_positions[1:], 1):
            sensor = cylinder(radius=0.005, height=0.003)
            sensor.apply_translation(pos)
            sensors.append(sensor)
        
        sensor_mesh = trimesh.util.concatenate(sensors)
        sensor_mesh.visual.face_colors = self.colors['sensors']
        
        return sensor_mesh
    
    def create_landing_gear(self):
        """Create retractable landing gear"""
        gear_parts = []
        
        # Front landing struts
        for y_sign in [-1, 1]:
            strut = box(extents=[0.006, 0.006, 0.035])
            strut.apply_translation([0.055, y_sign * 0.035, -0.020])
            gear_parts.append(strut)
        
        # Rear landing struts
        for y_sign in [-1, 1]:
            strut = box(extents=[0.006, 0.006, 0.035])
            strut.apply_translation([-0.055, y_sign * 0.035, -0.020])
            gear_parts.append(strut)
        
        # Landing feet
        for x_sign in [-1, 1]:
            for y_sign in [-1, 1]:
                foot = box(extents=[0.025, 0.008, 0.005])
                foot.apply_translation([x_sign * 0.055, y_sign * 0.035, -0.040])
                gear_parts.append(foot)
        
        gear = trimesh.util.concatenate(gear_parts)
        gear.visual.face_colors = self.colors['landing_gear']
        
        return gear
    
    def create_battery(self):
        """Create battery pack"""
        battery = box(extents=[0.055, 0.070, 0.018])
        battery.apply_translation([-0.035, 0, 0.02])
        
        # Battery contacts
        contacts = box(extents=[0.010, 0.005, 0.003])
        contacts.apply_translation([-0.005, 0, 0.030])
        
        battery_mesh = trimesh.util.concatenate([battery, contacts])
        battery_mesh.visual.face_colors = self.colors['battery']
        
        return battery_mesh
    
    def create_antennas(self):
        """Create communication antennas"""
        antennas = []
        
        # Main antenna (rear)
        antenna1 = cylinder(radius=0.002, height=0.015)
        antenna1.apply_translation([-0.065, 0, 0.040])
        antennas.append(antenna1)
        
        # Diversity antennas (sides)
        for y_sign in [-1, 1]:
            antenna = cylinder(radius=0.002, height=0.012)
            antenna.apply_translation([0, y_sign * 0.040, 0.040])
            antennas.append(antenna)
        
        antenna_mesh = trimesh.util.concatenate(antennas)
        antenna_mesh.visual.face_colors = self.colors['sensors']
        
        return antenna_mesh
    
    def create_status_leds(self):
        """Create status indicator LEDs"""
        leds = []
        
        # LED positions (front, rear, arm ends)
        led_positions = [
            [0.072, 0, 0.025],     # Front
            [-0.072, 0, 0.025],    # Rear
        ]
        
        for pos in led_positions:
            led = cylinder(radius=0.003, height=0.002)
            led.apply_translation(pos)
            leds.append(led)
        
        led_mesh = trimesh.util.concatenate(leds)
        
        # Green for status
        led_colors = np.tile([0, 200, 0, 255], (len(leds) * 50, 1))
        led_mesh.visual.face_colors = led_colors[:len(led_mesh.faces)]
        
        return led_mesh
    
    def assemble_drone(self):
        """Assemble all components into complete drone model"""
        print("Assembling drone components...")
        
        components = []
        
        # Main body
        print("  - Creating main body...")
        components.append(self.create_main_body())
        
        # Arms and motors (4 arms at 45°, 135°, 225°, 315°)
        arm_angles = [45, 135, 225, 315]
        
        for angle in arm_angles:
            print(f"  - Creating arm at {angle}°...")
            components.append(self.create_foldable_arm(angle))
            components.append(self.create_motor_mount(angle))
            components.append(self.create_propeller(angle))
        
        # Camera gimbal
        print("  - Creating camera gimbal...")
        components.append(self.create_camera_gimbal())
        
        # Obstacle sensors
        print("  - Creating obstacle sensors...")
        components.append(self.create_obstacle_sensors())
        
        # Landing gear
        print("  - Creating landing gear...")
        components.append(self.create_landing_gear())
        
        # Battery
        print("  - Creating battery...")
        components.append(self.create_battery())
        
        # Antennas
        print("  - Creating antennas...")
        components.append(self.create_antennas())
        
        # Status LEDs
        print("  - Creating status LEDs...")
        components.append(self.create_status_leds())
        
        # Combine all components
        print("Combining all components...")
        drone = trimesh.util.concatenate(components)
        
        return drone
    
    def export_model(self, drone_mesh, output_dir):
        """Export the drone model to various formats"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Ensure face colors match face count
        n_faces = len(drone_mesh.faces)
        if hasattr(drone_mesh.visual, 'face_colors'):
            fc = drone_mesh.visual.face_colors
            if len(fc) != n_faces:
                # Reset to uniform gray
                drone_mesh.visual.face_colors = np.tile([180, 180, 185, 255], (n_faces, 1))
        
        # Export STL
        stl_path = os.path.join(output_dir, 'NebulaCam_X1.stl')
        drone_mesh.export(stl_path)
        print(f"Exported STL: {stl_path}")
        
        # Export OBJ
        obj_path = os.path.join(output_dir, 'NebulaCam_X1.obj')
        drone_mesh.visual.face_colors = np.tile([180, 180, 185, 255], (n_faces, 1))
        drone_mesh.export(obj_path)
        print(f"Exported OBJ: {obj_path}")
        
        # Export GLB (for web viewing)
        glb_path = os.path.join(output_dir, 'NebulaCam_X1.glb')
        drone_mesh.export(glb_path)
        print(f"Exported GLB: {glb_path}")
        
        return stl_path, obj_path, glb_path
    
    def generate_specification_document(self, output_dir):
        """Generate technical specification document"""
        spec_content = f"""# NebulaCam X1 - Commercial Drone Design Specifications
## Inspired by DJI Lito Series

### Made with Nebula Cloud Studio

---

## Overview
The NebulaCam X1 is a commercial-grade aerial photography/videography drone 
designed for content creators, real estate photographers, and small businesses.

---

## Technical Specifications

### General
- **Model Name**: NebulaCam X1
- **Category**: Commercial Aerial Photography Drone
- **Target Weight**: {self.specs['target_weight']}g (under 249g regulatory threshold)
- **Max Takeoff Weight**: {self.specs['max_takeoff_weight']}g (with payload)

### Flight Performance
- **Maximum Flight Time**: {self.specs['flight_time']} minutes
- **Maximum Speed**: {self.specs['max_speed']} m/s ({self.specs['max_speed'] * 3.6:.1f} km/h)
- **Wind Resistance**: {self.specs['wind_resistance']} m/s
- **Operating Temperature**: {self.specs['operating_temp'][0]}°C to {self.specs['operating_temp'][1]}°C

### Camera System
- **Image Sensor**: {self.specs['camera']['sensor']}
- **Effective Pixels**: {self.specs['camera']['resolution']}
- **Video Resolution**: {self.specs['camera']['video']}
- **Aperture**: {self.specs['camera']['aperture']}
- **Gimbal Stabilization**: {self.specs['camera']['gimbal']}
- **Dynamic Range**: {self.specs['camera']['dynamic_range']}

### Obstacle Sensing
- **Sensing Type**: {self.specs['obstacle_sensing']['type']}
- **Detection Range**: {self.specs['obstacle_sensing']['range']}
- **LiDAR**: {self.specs['obstacle_sensing']['lidar']}
- **Vision Sensors**: {self.specs['obstacle_sensing']['cameras']} cameras

### Battery
- **Battery Type**: {self.specs['battery']['type']}
- **Capacity**: {self.specs['battery']['capacity']} mAh
- **Voltage**: {self.specs['battery']['voltage']}V
- **Battery Weight**: {self.specs['battery']['weight']}g

### Transmission
- **Transmission System**: {self.specs['transmission']['type']}
- **Maximum Range**: {self.specs['transmission']['max_range']} km
- **Frequency**: {self.specs['transmission']['frequency']}

### Dimensions
- **Folded**: {self.specs['dimensions']['folded'][0]} × {self.specs['dimensions']['folded'][1]} × {self.specs['dimensions']['folded'][2]} mm
- **Unfolded**: {self.specs['dimensions']['unfolded'][0]} × {self.specs['dimensions']['unfolded'][1]} × {self.specs['dimensions']['unfolded'][2]} mm

---

## Key Features

### 1. Sub-249g Design
- No FAA registration required for recreational use
- C0 classification in Europe
- Simplified regulatory compliance

### 2. Omnidirectional Obstacle Sensing
- 6 vision sensors for 360° protection
- Forward-facing LiDAR for enhanced detection
- Reliable operation in low-light conditions

### 3. Professional Camera System
- 1/1.3" CMOS sensor with 48MP resolution
- 4K/60fps video with 10-bit D-Log M
- 14 stops of dynamic range for HDR content
- 3-axis mechanical gimbal stabilization

### 4. Extended Flight Time
- 38 minutes standard flight time
- Intelligent battery management
- Quick charge capability

### 5. Advanced Transmission
- O4 transmission system
- 20 km maximum range
- Dual-band 2.4/5.8 GHz operation

---

## Design Philosophy

The NebulaCam X1 draws inspiration from the DJI Lito series, incorporating:

1. **Compact Folding Design**: Arms fold inward for easy transport
2. **Lightweight Construction**: Advanced materials for sub-249g weight
3. **User-Friendly Interface**: Intuitive controls for beginners
4. **Safety First**: Comprehensive obstacle avoidance system
5. **Professional Output**: High-quality imaging capabilities

---

## Applications

- Real estate photography and videography
- Content creation for social media
- Small business marketing
- Event documentation
- Travel photography
- Insurance inspection (basic)

---

## Compliance

- FCC certified
- CE marked (Europe)
- Under 249g weight class
- C0 classification (EU)

---

## Technical Drawings

3D model files available:
- `NebulaCam_X1.stl` - Standard STL format
- `NebulaCam_X1.obj` - OBJ format with materials
- `NebulaCam_X1.glb` - GLB format for web viewing

---

**Document Version**: 1.0  
**Design Date**: July 2026  
**Designer**: Studio AI Copilot  
**Made with Nebula Cloud Studio**
"""
        
        doc_path = os.path.join(output_dir, 'NebulaCam_X1_Specifications.md')
        with open(doc_path, 'w') as f:
            f.write(spec_content)
        
        print(f"Generated specification document: {doc_path}")
        return doc_path


def main():
    """Main function to create and export drone design"""
    print("=" * 60)
    print("NebulaCam X1 - Commercial Drone Design")
    print("Inspired by DJI Lito Series")
    print("Made with Nebula Cloud Studio")
    print("=" * 60)
    
    # Initialize drone design
    drone_design = DroneDesign()
    
    # Assemble drone model
    drone_mesh = drone_design.assemble_drone()
    
    # Print mesh statistics
    print("\nModel Statistics:")
    print(f"  Vertices: {len(drone_mesh.vertices):,}")
    print(f"  Faces: {len(drone_mesh.faces):,}")
    print(f"  Volume: {drone_mesh.volume * 1e6:.2f} cm³")
    print(f"  Bounding Box: {drone_mesh.bounding_box.extents * 1000} mm")
    
    # Output directory
    output_dir = os.path.join(os.path.dirname(__file__), 'output')
    
    # Export model files
    print("\nExporting model files...")
    stl_path, obj_path, glb_path = drone_design.export_model(drone_mesh, output_dir)
    
    # Generate specification document
    print("\nGenerating specification document...")
    spec_path = drone_design.generate_specification_document(output_dir)
    
    print("\n" + "=" * 60)
    print("Design Complete!")
    print("=" * 60)
    print(f"\nOutput files:")
    print(f"  - 3D Model (STL): {stl_path}")
    print(f"  - 3D Model (OBJ): {obj_path}")
    print(f"  - 3D Model (GLB): {glb_path}")
    print(f"  - Specifications: {spec_path}")
    print(f"\nMade with Nebula Cloud Studio")


if __name__ == "__main__":
    main()
