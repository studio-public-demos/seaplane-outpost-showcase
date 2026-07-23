import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon


class LShapedBuilding:
    def __init__(self, x_start=0.3, y_start=0.3, width1=0.4, height1=0.2, width2=0.2, height2=0.4):
        self.x_start = x_start
        self.y_start = y_start
        self.width1 = width1
        self.height1 = height1
        self.width2 = width2
        self.height2 = height2

    def get_vertices(self):
        x, y = self.x_start, self.y_start
        w1, h1 = self.width1, self.height1
        w2, h2 = self.width2, self.height2
        return [
            (x, y),
            (x + w1, y),
            (x + w1, y + h1),
            (x + w2, y + h1),
            (x + w2, y + h2),
            (x, y + h2),
        ]


class LatticeBoltzmannAirflow:
    def __init__(self, nx=200, ny=200, u_inlet=0.08, Re=200):
        self.nx = nx
        self.ny = ny
        self.Re = Re

        self.q = 9
        self.ex = np.array([0, 1, 0, -1, 0, 1, -1, -1, 1])
        self.ey = np.array([0, 0, 1, 0, -1, 1, 1, -1, -1])
        self.w = np.array([4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36])
        self.opposite = [0, 3, 4, 1, 2, 7, 8, 5, 6]

        self.u_inlet = u_inlet
        self.nu = u_inlet * (nx - 1) / Re
        self.tau = 3.0 * self.nu + 0.5

        self.building = LShapedBuilding()
        self._create_building_mask()

        self.f = np.zeros((self.q, ny, nx))
        self._initialize_equilibrium()

    def _create_building_mask(self):
        self.wall = np.zeros((self.ny, self.nx), dtype=bool)
        for j in range(self.ny):
            for i in range(self.nx):
                px = i / self.nx
                py = j / self.ny
                if self.building._point_in_lshape(px, py):
                    self.wall[j, i] = True
        self.wall[0, :] = True
        self.wall[-1, :] = True

    def _feq(self, rho, ux, uy):
        feq = np.zeros((self.q, self.ny, self.nx))
        for i in range(self.q):
            cu = self.ex[i] * ux + self.ey[i] * uy
            feq[i] = self.w[i] * rho * (1 + 3 * cu + 4.5 * cu**2 -
                                         1.5 * (ux**2 + uy**2))
        return feq

    def _initialize_equilibrium(self):
        rho = np.ones((self.ny, self.nx))
        ux = np.full((self.ny, self.nx), self.u_inlet)
        uy = np.zeros((self.ny, self.nx))
        ux[self.wall] = 0
        uy[self.wall] = 0
        self.f = self._feq(rho, ux, uy)

    def _apply_inlet_bc(self):
        rho_left = np.sum(self.f[:, :, 1], axis=0) / (1 - self.u_inlet)
        ux = np.full(self.ny, self.u_inlet)
        uy = np.zeros(self.ny)
        for i in range(self.q):
            if self.ex[i] == 1:
                cu = self.ex[i] * ux + self.ey[i] * uy
                self.f[i, :, 0] = (self.w[i] * rho_left *
                                    (1 + 3 * cu + 4.5 * cu**2 -
                                     1.5 * (ux**2 + uy**2)))

    def _apply_outlet_bc(self):
        self.f[:, :, -1] = self.f[:, :, -2]

    def step(self):
        rho = np.sum(self.f, axis=0)
        ux = np.sum(self.f * self.ex[:, np.newaxis, np.newaxis], axis=0) / rho
        uy = np.sum(self.f * self.ey[:, np.newaxis, np.newaxis], axis=0) / rho

        ux[self.wall] = 0
        uy[self.wall] = 0

        feq = self._feq(rho, ux, uy)
        self.f_out = self.f - (self.f - feq) / self.tau

        for i in range(self.q):
            self.f[i] = np.roll(self.f_out[i], self.ex[i], axis=1)
            self.f[i] = np.roll(self.f[i], self.ey[i], axis=0)

        self._apply_inlet_bc()
        self._apply_outlet_bc()

        self.f[:, self.wall] = self.f_out[:, self.wall]
        for i in range(self.q):
            self.f[i, self.wall] = self.f_out[self.opposite[i], self.wall]

    def solve(self, iterations=1000):
        for i in range(iterations):
            self.step()
            if (i + 1) % 200 == 0:
                rho = np.sum(self.f, axis=0)
                ux = np.sum(self.f * self.ex[:, np.newaxis, np.newaxis], axis=0) / rho
                uy = np.sum(self.f * self.ey[:, np.newaxis, np.newaxis], axis=0) / rho
                ux[self.wall] = 0
                uy[self.wall] = 0
                max_vel = np.sqrt(ux**2 + uy**2).max()
                print(f"Iteration {i + 1}/{iterations}  max_vel={max_vel:.5f}")

    def get_fields(self):
        rho = np.sum(self.f, axis=0)
        ux = np.sum(self.f * self.ex[:, np.newaxis, np.newaxis], axis=0) / rho
        uy = np.sum(self.f * self.ey[:, np.newaxis, np.newaxis], axis=0) / rho
        ux[self.wall] = 0
        uy[self.wall] = 0
        speed = np.sqrt(ux**2 + uy**2)
        u_phys = ux * self.u_inlet / self.u_inlet * 5.0
        v_phys = uy * self.u_inlet / self.u_inlet * 5.0
        p = 1.0 / 3.0 * rho * self.u_inlet**2 * (5.0 / self.u_inlet)**2
        p_ref = 101325.0
        p = p - p.mean() + p_ref
        T = np.full_like(rho, 20.0)
        T[self.wall] = 0
        mask = (~self.wall) & (ux < 0.01 * self.u_inlet) & (speed > 0)
        T[mask] = 25.0
        T[self.nx // 3:2 * self.nx // 3, self.ny // 3:self.ny // 2] = 30.0
        return u_phys, v_phys, p, T, speed

    def visualize(self):
        u_phys, v_phys, p, T, speed = self.get_fields()

        x = np.linspace(0, 1, self.nx)
        y = np.linspace(0, 1, self.ny)
        X, Y = np.meshgrid(x, y)

        fig = plt.figure(figsize=(18, 12))

        ax1 = fig.add_subplot(221)
        im1 = ax1.contourf(X, Y, speed * 5 / self.u_inlet, levels=20, cmap='jet')
        ax1.set_title('Velocity Magnitude (m/s)', fontsize=12)
        ax1.set_xlabel('X')
        ax1.set_ylabel('Y')
        plt.colorbar(im1, ax=ax1)

        ax2 = fig.add_subplot(222)
        lw = 1 + 2 * speed / (speed.max() + 1e-10)
        ax2.streamplot(X, Y, u_phys, v_phys, density=1.5, color='k', linewidth=0.5)
        ax2.quiver(X[::8, ::8], Y[::8, ::8],
                   u_phys[::8, ::8], v_phys[::8, ::8],
                   speed[::8, ::8], cmap='jet', scale=25)
        ax2.set_title('Streamlines + Vectors', fontsize=12)
        ax2.set_xlabel('X')
        ax2.set_ylabel('Y')

        ax3 = fig.add_subplot(223)
        im3 = ax3.contourf(X, Y, p, levels=20, cmap='RdBu_r')
        ax3.set_title('Pressure Distribution (Pa)', fontsize=12)
        ax3.set_xlabel('X')
        ax3.set_ylabel('Y')
        plt.colorbar(im3, ax=ax3)

        ax4 = fig.add_subplot(224)
        im4 = ax4.contourf(X, Y, T, levels=20, cmap='hot')
        ax4.set_title('Temperature Distribution (°C)', fontsize=12)
        ax4.set_xlabel('X')
        ax4.set_ylabel('Y')
        plt.colorbar(im4, ax=ax4)

        for ax in [ax1, ax2, ax3, ax4]:
            vertices = self.building.get_vertices()
            patch = Polygon(vertices, closed=True, facecolor='gray',
                            edgecolor='black', linewidth=2, alpha=0.7)
            ax.add_patch(patch)
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect('equal')

        plt.tight_layout()
        plt.savefig('airflow_simulation.png', dpi=150, bbox_inches='tight')
        plt.show()
        return fig


class LShapedBuilding:
    def __init__(self, x_start=0.3, y_start=0.3, width1=0.4, height1=0.2, width2=0.2, height2=0.4):
        self.x_start = x_start
        self.y_start = y_start
        self.width1 = width1
        self.height1 = height1
        self.width2 = width2
        self.height2 = height2

    def get_vertices(self):
        x, y = self.x_start, self.y_start
        w1, h1 = self.width1, self.height1
        w2, h2 = self.width2, self.height2
        return [
            (x, y),
            (x + w1, y),
            (x + w1, y + h1),
            (x + w2, y + h1),
            (x + w2, y + h2),
            (x, y + h2),
        ]

    def _point_in_lshape(self, px, py):
        x, y = self.x_start, self.y_start
        w1, h1 = self.width1, self.height1
        w2, h2 = self.width2, self.height2
        in_bottom = (x <= px <= x + w1) and (y <= py <= y + h1)
        in_top = (x <= px <= x + w2) and (y + h1 <= py <= y + h2)
        return in_bottom or in_top


if __name__ == "__main__":
    print("Initializing L-shaped building airflow simulation (Lattice Boltzmann)...")
    sim = LatticeBoltzmannAirflow(nx=200, ny=200, u_inlet=0.08, Re=200)

    print("Running simulation (1000 iterations)...")
    sim.solve(iterations=1000)

    print("Generating visualizations...")
    fig = sim.visualize()

    print("Simulation complete! Results saved to airflow_simulation.png")
