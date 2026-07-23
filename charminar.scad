// ============================================================
// CHARMINAR - Hyderabad, India
// Accurate parametric 3D model
// Minarets rise from ROOF, not ground
// ============================================================

$fn = 48;

// ---------- Proportions (all in mm, relative scale) ----------
BASE_W        = 60;    // Plinth width
BASE_H        = 4;     // Plinth height
BLDG_W        = 52;    // Main building footprint
BLDG_H        = 30;    // Main building height (ground to roof)
GALLERY_H     = 10;    // Upper gallery/2nd story height
ARCH_W        = 16;    // Grand arch width
ARCH_H        = 24;    // Grand arch height
ARCH_CUT      = 14;    // How deep arches cut inward

// Minarets: start at roof level, extend upward
MIN_BASE_R    = 3.5;   // Radius at roof level
MIN_TOP_R     = 2.0;   // Radius at top
MIN_H         = 42;    // Height ABOVE roof
MIN_LEVELS    = 3;     // Balcony rings per minaret

DOME_R        = 7;     // Central dome radius
DOME_H        = 9;     // Central dome height
FINIAL_H      = 4;     // Central spire

SMALL_DOME_R  = 2.8;   // Minaret top dome
SMALL_DOME_H  = 4;

// ---------- Helpers ----------

module onion_dome(r, h) {
    union() {
        translate([0, 0, 0])
            scale([1, 1, h / r])
                sphere(r = r);
        translate([0, 0, h * 0.65])
            cylinder(r1 = r * 0.3, r2 = 0.08, h = h * 0.55);
    }
}

// Pointed Islamic arch as a 2D polygon (for extrusion)
module arch_profile(w, h) {
    polygon([
        [-w/2, 0],
        [ w/2, 0],
        [ w/2, h * 0.5],
        [ w*0.35, h * 0.48],
        [ 0, h],
        [-w*0.35, h * 0.48],
        [-w/2, h * 0.5],
    ]);
}

// ---------- Components ----------

module base_plinth() {
    union() {
        // Main platform
        translate([0, 0, -BLDG_H/2 - BASE_H/2])
            cube([BASE_W + 4, BASE_W + 4, BASE_H], center = true);

        // Steps on 4 sides
        for (a = [0:3]) rotate([0, 0, a * 90]) {
            for (s = [0:4]) {
                step_y = BASE_W/2 + 1 + s * 1.4;
                step_z = -BLDG_H/2 - BASE_H + s * 1;
                translate([0, step_y, step_z])
                    cube([BASE_W + 2, 1.4, 1], center = true);
            }
        }
    }
}

module main_building() {
    difference() {
        // Solid block
        translate([0, 0, 0])
            cube([BLDG_W, BLDG_W, BLDG_H], center = true);

        // Four grand arches
        for (a = [0:3]) rotate([0, 0, a * 90]) {
            translate([0, BLDG_W/2, BLDG_H/2 - ARCH_H - 2])
                rotate([90, 0, 0])
                    linear_extrude(ARCH_CUT)
                        arch_profile(ARCH_W, ARCH_H);
        }

        // Four smaller arches on upper gallery
        for (a = [0:3]) rotate([0, 0, a * 90]) {
            translate([0, BLDG_W/2, BLDG_H/2 - GALLERY_H + 1])
                rotate([90, 0, 0])
                    linear_extrude(ARCH_CUT * 0.6)
                        arch_profile(ARCH_W * 0.55, GALLERY_H * 0.85);
        }

        // Side windows on upper gallery (2 per face)
        for (a = [0:3]) rotate([0, 0, a * 90]) {
            for (x = [-1, 1]) {
                translate([x * BLDG_W * 0.27, BLDG_W/2, BLDG_H/2 - GALLERY_H + 1])
                    rotate([90, 0, 0])
                        linear_extrude(ARCH_CUT * 0.35)
                            arch_profile(ARCH_W * 0.28, GALLERY_H * 0.6);
            }
        }
    }
}

module string_course(z, size, t) {
    translate([0, 0, z])
        difference() {
            cube([size + t*2, size + t*2, 0.8], center = true);
            cube([size - 1.5, size - 1.5, 1], center = true);
        }
}

module parapet(size) {
    translate([0, 0, BLDG_H/2]) {
        difference() {
            cube([size + 0.5, size + 0.5, 2.5], center = true);
            cube([size - 2, size - 2, 3], center = true);
        }
        // Crenellations
        for (a = [0:3]) rotate([0, 0, a * 90]) {
            for (x = [-size/2 + 3 : 4.5 : size/2 - 3]) {
                translate([x, size/2, 1.8])
                    cube([2.2, 1, 2.5], center = true);
            }
        }
    }
}

module minaret() {
    // Main shaft (starts at roof level BLDG_H/2)
    union() {
        cylinder(r1 = MIN_BASE_R, r2 = MIN_TOP_R, h = MIN_H);

        // Balcony rings
        for (i = [1:MIN_LEVELS]) {
            z = (MIN_H / (MIN_LEVELS + 1)) * i;
            r = MIN_BASE_R - (MIN_BASE_R - MIN_TOP_R) * (z / MIN_H);
            translate([0, 0, z])
                rotate_extrude($fn = 32)
                    translate([r, 0])
                        polygon([
                            [0, -0.6],
                            [1.8, -0.6],
                            [1.8, 0.6],
                            [0, 0.6],
                        ]);
            // Brackets
            for (j = [0:7]) rotate([0, 0, j * 45])
                translate([r + 0.3, 0, 0])
                    cube([1.2, 0.6, 0.5], center = true);
        }

        // Top dome
        translate([0, 0, MIN_H])
            onion_dome(SMALL_DOME_R, SMALL_DOME_H);
    }
}

module chhatri(r, h) {
    // Small pillar-supported dome on the roof
    union() {
        // Pillars
        for (i = [0:5]) rotate([0, 0, i * 60])
            translate([r * 0.65, 0, 0])
                cylinder(r = 0.4, h = h * 0.5);
        // Dome
        translate([0, 0, h * 0.5])
            onion_dome(r, h * 0.8);
    }
}

// ---------- Assembly ----------
module charminar() {
    union() {
        base_plinth();
        main_building();

        // Horizontal string courses
        string_course(BLDG_H/2 - GALLERY_H, BLDG_W, 1.2);
        string_course(-BLDG_H/2 + 2, BLDG_W, 1);
        string_course(BLDG_H/2 - GALLERY_H - 4, BLDG_W, 0.6);

        // Parapet
        parapet(BLDG_W);

        // 4 minarets at roof corners (roof = BLDG_H/2)
        corner = BLDG_W/2 - MIN_BASE_R - 2.5;
        for (a = [0:3]) rotate([0, 0, a * 90 + 45])
            translate([corner, corner, BLDG_H/2])
                minaret();

        // Central dome on roof
        translate([0, 0, BLDG_H/2 + 2.5])
            onion_dome(DOME_R, DOME_H);

        // 4 chhatris on roof
        ch_corner = BLDG_W/2 - 8;
        for (a = [0:3]) rotate([0, 0, a * 90 + 45])
            translate([ch_corner, ch_corner, BLDG_H/2])
                chhatri(2.5, 5);
    }
}

color("NavajoWhite") charminar();
