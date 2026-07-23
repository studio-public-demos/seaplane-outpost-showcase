import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.patches import Rectangle
import matplotlib.gridspec as gridspec
from matplotlib import cm
import os
import warnings
warnings.filterwarnings('ignore')

NX, NY = 200, 100
NU = 0.04
RE = 100
U_INF = 0.08
TAU = 3.0 * NU + 0.5
OMEGA = 1.0 / TAU
MAX_V = 0.3

Q = 9
C_X = np.array([0, 1, 0, -1, 0, 1, -1, -1, 1])
C_Y = np.array([0, 0, 1, 0, -1, 1, 1, -1, -1])
W = np.array([4/9] + [1/9]*4 + [1/36]*4)

def make_l_shape(nx, ny):
    mask = np.zeros((nx, ny), dtype=bool)
    bx, by = 40, 20
    hw, hh = 50, 40
    mask[bx:bx+hw, by:by+hh] = True
    vw, vh = 25, 40
    mask[bx:bx+vw, by+hh:by+hh+vh] = True
    return mask

def equilibrium(rho, ux, uy):
    f_eq = np.zeros((Q, NX, NY))
    ux_c = np.clip(ux, -MAX_V, MAX_V)
    uy_c = np.clip(uy, -MAX_V, MAX_V)
    for i in range(Q):
        cu = C_X[i] * ux_c + C_Y[i] * uy_c
        f_eq[i] = W[i] * rho * (1.0 + 3.0*cu + 4.5*cu**2 - 1.5*(ux_c**2 + uy_c**2))
    return f_eq

def run_simulation(steps=2000, snapshot_interval=40):
    rho = np.ones((NX, NY))
    ux = np.full((NX, NY), U_INF)
    uy = np.zeros((NX, NY))
    obstacle = make_l_shape(NX, NY)
    ux[obstacle] = 0
    uy[obstacle] = 0

    f_eq = equilibrium(rho, ux, uy)
    f = f_eq.copy()
    f_inlet = f_eq[:, 0, :].copy()

    snapshots = []
    snap_indices = set(range(300, steps, snapshot_interval))
    snap_indices.add(steps - 1)

    print(f"Running LBM CFD: {NX}x{NY}, {steps} steps, tau={TAU:.3f}, omega={OMEGA:.3f}...")
    for t in range(steps):
        rho = np.sum(f, axis=0)
        rho = np.clip(rho, 0.5, 2.0)
        ux = np.sum(f * C_X[:, None, None], axis=0) / rho
        uy = np.sum(f * C_Y[:, None, None], axis=0) / rho

        ux[obstacle] = 0
        uy[obstacle] = 0
        rho[obstacle] = 1.0

        ux[:, 0] = U_INF
        uy[:, 0] = 0
        rho[:, 0] = 1.0

        ux = np.clip(ux, -MAX_V, MAX_V)
        uy = np.clip(uy, -MAX_V, MAX_V)

        f_eq = equilibrium(rho, ux, uy)
        f_out = f - OMEGA * (f - f_eq)

        f_stream = np.zeros_like(f)
        for i in range(Q):
            f_stream[i] = np.roll(np.roll(f_out[i], C_X[i], axis=0), C_Y[i], axis=1)

        f_stream[:, 0, :] = f_inlet

        f_stream[:, :, -1] = f[:, :, -2]

        for i in range(Q):
            f_stream[i][obstacle] = f_eq[i][obstacle]

        f = f_stream

        if t in snap_indices:
            vmag = np.sqrt(ux**2 + uy**2)
            snapshots.append((t, rho.copy(), ux.copy(), uy.copy(), vmag.copy()))
            if len(snap_indices) > 0 and len(snapshots) % 3 == 0:
                print(f"  t={t}/{steps}  max_v={vmag.max():.4f}  rho_range=[{rho.min():.3f},{rho.max():.3f}]")

    print(f"Simulation complete. {len(snapshots)} snapshots captured.")
    return snapshots, obstacle

def draw_building(ax, obstacle, **kwargs):
    contours = ax.contour(
        np.arange(NX), np.arange(NY), obstacle.astype(float).T,
        levels=[0.5], colors=kwargs.get('edgecolor', 'black'),
        linewidths=kwargs.get('linewidths', 2.0)
    )
    return contours

def plot_velocity_field(ux, uy, vmag, obstacle, t, savepath):
    fig, ax = plt.subplots(figsize=(12, 6))
    speed_masked = np.ma.array(vmag.T, mask=obstacle.T)
    im = ax.imshow(speed_masked, cmap='coolwarm', origin='lower', aspect='auto',
                   vmin=0, vmax=U_INF*2.5, interpolation='bilinear')
    draw_building(ax, obstacle, edgecolor='black', linewidths=2.5)

    step = 6
    Y, X = np.mgrid[0:NY:step, 0:NX:step]
    U = ux[::step, ::step].T
    V = uy[::step, ::step].T
    speed_q = np.sqrt(U**2 + V**2)
    mask_q = speed_q > 0.005
    ax.quiver(X[mask_q], Y[mask_q], U[mask_q], V[mask_q],
              speed_q[mask_q], cmap='gray', alpha=0.5, scale=25)

    fig.colorbar(im, ax=ax, label='Velocity magnitude (lattice units)', shrink=0.85)
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_title(f'L-Shaped Building — Velocity Field  (t = {t})')
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.tight_layout()
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def plot_streamlines(ux, uy, obstacle, t, savepath):
    fig, ax = plt.subplots(figsize=(12, 6))
    speed = np.sqrt(ux**2 + uy**2)
    lw = 1 + 3 * speed / max(speed.max(), 1e-6)
    lw = np.clip(lw, 0.3, 5)

    sx = np.arange(NX)
    sy = np.arange(NY)
    X2d, Y2d = np.meshgrid(sx, sy, indexing='ij')
    color_data = speed.T

    ax.streamplot(np.arange(NY), np.arange(NX), uy, ux, color=speed, cmap='plasma',
                  linewidth=lw, density=2.0, arrowsize=0.8)

    draw_building(ax, obstacle, edgecolor='white', linewidths=2.5)
    ax.set_facecolor('#1a0a2e')
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_title(f'L-Shaped Building — Streamlines  (t = {t})')
    sm = cm.ScalarMappable(cmap='plasma', norm=plt.Normalize(0, speed.max()))
    sm.set_array([])
    fig.colorbar(sm, ax=ax, label='Speed', shrink=0.85)
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.tight_layout()
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def plot_pressure(rho, obstacle, t, savepath):
    fig, ax = plt.subplots(figsize=(12, 6))
    pressure = rho / 3.0
    p_masked = np.ma.array(pressure.T, mask=obstacle.T)
    im = ax.imshow(p_masked, cmap='RdYlBu_r', origin='lower', aspect='auto')
    draw_building(ax, obstacle, edgecolor='black', linewidths=2.5)
    ax.contour(np.arange(NX), np.arange(NY), pressure.T, levels=20, colors='k', linewidths=0.3, alpha=0.3)
    fig.colorbar(im, ax=ax, label='Pressure', shrink=0.85)
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_title(f'L-Shaped Building — Pressure Distribution  (t = {t})')
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.tight_layout()
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def plot_comprehensive(ux, uy, vmag, rho, obstacle, t, savepath):
    fig = plt.figure(figsize=(18, 14))
    gs = gridspec.GridSpec(2, 2, hspace=0.3, wspace=0.3)

    ax1 = fig.add_subplot(gs[0, 0])
    p1 = ax1.imshow(vmag.T, cmap='coolwarm', origin='lower', aspect='auto', vmin=0, vmax=U_INF*2.5)
    draw_building(ax1, obstacle, edgecolor='black', linewidths=2)
    step = 8
    Y, X = np.mgrid[0:NY:step, 0:NX:step]
    U = ux[::step, ::step].T
    V = uy[::step, ::step].T
    sp = np.sqrt(U**2 + V**2)
    m = sp > 0.005
    ax1.quiver(X[m], Y[m], U[m], V[m], sp[m], cmap='gray', alpha=0.5, scale=30)
    fig.colorbar(p1, ax=ax1, shrink=0.7, label='|V|')
    ax1.set_title('Velocity Field')

    ax2 = fig.add_subplot(gs[0, 1])
    speed = np.sqrt(ux**2 + uy**2)
    lw = np.clip(1 + 3 * speed / max(speed.max(), 1e-6), 0.3, 5)
    ax2.streamplot(np.arange(NY), np.arange(NX), uy, ux, color=speed, cmap='plasma',
                   linewidth=lw, density=2.0, arrowsize=0.7)
    draw_building(ax2, obstacle, edgecolor='white', linewidths=2)
    ax2.set_facecolor('#1a0a2e')
    ax2.set_title('Streamlines')

    ax3 = fig.add_subplot(gs[1, 0])
    pressure = rho / 3.0
    p_masked = np.ma.array(pressure.T, mask=obstacle.T)
    im3 = ax3.imshow(p_masked, cmap='RdYlBu_r', origin='lower', aspect='auto')
    draw_building(ax3, obstacle, edgecolor='black', linewidths=2)
    fig.colorbar(im3, ax=ax3, shrink=0.7, label='P')
    ax3.set_title('Pressure')

    ax4 = fig.add_subplot(gs[1, 1])
    ax4.set_facecolor('#0a0a2e')
    step = 10
    Y4, X4 = np.mgrid[0:NY:step, 0:NX:step]
    U4 = ux[::step, ::step].T
    V4 = uy[::step, ::step].T
    sp4 = np.sqrt(U4**2 + V4**2)
    ax4.quiver(X4, Y4, U4, V4, color='cyan', alpha=0.8, scale=35, width=0.005)
    draw_building(ax4, obstacle, edgecolor='#6666ff', linewidths=2)
    ax4.set_title('Aerodynamic Vector Field')

    fig.suptitle(f'L-Shaped Building CFD Analysis  (t = {t})', fontsize=16, fontweight='bold', y=0.98)
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def plot_wake_analysis(ux, uy, vmag, obstacle, t, savepath):
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    ax = axes[0]
    mid_y = NY // 2
    x_arr = np.arange(NX)
    vel_profile = ux[:, mid_y]
    ax.plot(x_arr, vel_profile / U_INF, 'b-', linewidth=2, label='u/u_inf')
    bx, hw = 40, 50
    ax.axvspan(bx, bx + hw, alpha=0.2, color='gray', label='Building')
    ax.set_xlabel('X position')
    ax.set_ylabel('Velocity / u_inf')
    ax.set_title('Centerline Velocity Profile')
    ax.legend()
    ax.grid(True, alpha=0.3)

    ax = axes[1]
    mid_x = 70
    y_arr = np.arange(NY)
    vel_profile_y = np.sqrt(ux[mid_x, :]**2 + uy[mid_x, :]**2)
    ax.plot(y_arr, vel_profile_y / U_INF, 'r-', linewidth=2)
    by, hh = 20, 40
    ax.axvspan(by, by + hh, alpha=0.2, color='gray', label='Building')
    ax.set_xlabel('Y position')
    ax.set_ylabel('Speed / u_inf')
    ax.set_title(f'Transverse Profile at x={mid_x}')
    ax.legend()
    ax.grid(True, alpha=0.3)

    ax = axes[2]
    cp = 1.0 - (vmag / U_INF)**2
    cp_clipped = np.clip(cp, -2.0, 2.0)
    cp_masked = np.ma.array(cp_clipped.T, mask=obstacle.T)
    im = ax.imshow(cp_masked, cmap='RdBu_r', origin='lower', aspect='auto', vmin=-1.5, vmax=1.5)
    draw_building(ax, obstacle, edgecolor='black', linewidths=2)
    fig.colorbar(im, ax=ax, shrink=0.7, label='Cp')
    ax.set_title('Pressure Coefficient Cp')

    fig.suptitle(f'Wake & Pressure Analysis  (t = {t})', fontsize=14, fontweight='bold')
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def plot_turbulence_intensity(ux, uy, snapshots, obstacle, savepath):
    recent = snapshots[-min(20, len(snapshots)):]
    ux_accum = np.zeros((NX, NY))
    for _, _, ux_t, _, _ in recent:
        ux_accum += ux_t
    ux_mean = ux_accum / len(recent)
    ux_var = np.zeros((NX, NY))
    for _, _, ux_t, _, _ in recent:
        ux_var += (ux_t - ux_mean)**2
    ti = np.sqrt(ux_var / len(recent)) / U_INF * 100

    fig, ax = plt.subplots(figsize=(12, 6))
    ti_masked = np.ma.array(ti.T, mask=obstacle.T)
    im = ax.imshow(ti_masked, cmap='hot', origin='lower', aspect='auto', vmin=0)
    draw_building(ax, obstacle, edgecolor='white', linewidths=2)
    fig.colorbar(im, ax=ax, label='Turbulence Intensity (%)', shrink=0.85)
    ax.set_title('Turbulence Intensity Field')
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.tight_layout()
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")

def create_summary_dashboard(snapshots, obstacle, savepath):
    final = snapshots[-1]
    t, rho, ux, uy, vmag = final
    pressure = rho / 3.0

    fig = plt.figure(figsize=(20, 16))
    gs = gridspec.GridSpec(3, 3, hspace=0.35, wspace=0.3)
    titles = [
        'Velocity Magnitude', 'Streamlines', 'Pressure Field',
        'Pressure Coefficient (Cp)', 'Velocity Vectors', 'Turbulence',
        'X-Velocity', 'Y-Velocity', 'Vorticity'
    ]

    for idx in range(9):
        ax = fig.add_subplot(gs[idx // 3, idx % 3])

        if idx == 0:
            im = ax.imshow(vmag.T, cmap='coolwarm', origin='lower', aspect='auto', vmin=0, vmax=U_INF*2.5)
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 1:
            speed = np.sqrt(ux**2 + uy**2)
            lw = np.clip(1 + 3 * speed / max(speed.max(), 1e-6), 0.3, 4)
            ax.streamplot(np.arange(NY), np.arange(NX), uy, ux, color=speed, cmap='plasma',
                          linewidth=lw, density=2.0, arrowsize=0.5)
        elif idx == 2:
            pm = np.ma.array(pressure.T, mask=obstacle.T)
            im = ax.imshow(pm, cmap='RdYlBu_r', origin='lower', aspect='auto')
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 3:
            cp = np.clip(1.0 - (vmag / U_INF)**2, -2, 2)
            pm = np.ma.array(cp.T, mask=obstacle.T)
            im = ax.imshow(pm, cmap='RdBu_r', origin='lower', aspect='auto', vmin=-1.5, vmax=1.5)
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 4:
            step = 8
            Y, X = np.mgrid[0:NY:step, 0:NX:step]
            U = ux[::step, ::step].T
            V = uy[::step, ::step].T
            sp = np.sqrt(U**2 + V**2)
            m = sp > 0.005
            ax.quiver(X[m], Y[m], U[m], V[m], sp[m], cmap='coolwarm', alpha=0.8, scale=25)
        elif idx == 5:
            vy = np.gradient(uy, axis=0) - np.gradient(ux, axis=1)
            vm = np.ma.array(np.abs(vy).T, mask=obstacle.T)
            im = ax.imshow(vm, cmap='inferno', origin='lower', aspect='auto')
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 6:
            um = np.ma.array(ux.T, mask=obstacle.T)
            im = ax.imshow(um, cmap='RdBu_r', origin='lower', aspect='auto')
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 7:
            vm2 = np.ma.array(uy.T, mask=obstacle.T)
            im = ax.imshow(vm2, cmap='RdBu_r', origin='lower', aspect='auto')
            fig.colorbar(im, ax=ax, shrink=0.55)
        elif idx == 8:
            omega_z = np.gradient(uy.T, axis=0) - np.gradient(ux.T, axis=1)
            omega_m = np.ma.array(omega_z, mask=obstacle.T)
            im = ax.imshow(omega_m, cmap='seismic', origin='lower', aspect='auto')
            fig.colorbar(im, ax=ax, shrink=0.55)

        draw_building(ax, obstacle, edgecolor='black', linewidths=1.5)
        ax.set_title(titles[idx], fontsize=10, fontweight='bold')

    fig.suptitle(f'L-Shaped Building — Complete CFD Dashboard\nRe={RE}  |  Grid={NX}x{NY}  |  t={t}',
                 fontsize=16, fontweight='bold', y=0.98)
    fig.text(0.99, 0.01, 'Made with Nebula Cloud Studio', ha='right', va='bottom', fontsize=7, alpha=0.5)
    fig.savefig(savepath, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {savepath}")


if __name__ == '__main__':
    outdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cfd_output')
    os.makedirs(outdir, exist_ok=True)

    snapshots, obstacle = run_simulation(steps=2000, snapshot_interval=40)

    final = snapshots[-1]
    t, rho, ux, uy, vmag = final

    print("\nGenerating visualizations...")
    plot_velocity_field(ux, uy, vmag, obstacle, t,
                        os.path.join(outdir, '01_velocity_field.png'))
    plot_streamlines(ux, uy, obstacle, t,
                     os.path.join(outdir, '02_streamlines.png'))
    plot_pressure(rho, obstacle, t,
                  os.path.join(outdir, '03_pressure_distribution.png'))
    plot_comprehensive(ux, uy, vmag, rho, obstacle, t,
                       os.path.join(outdir, '04_comprehensive_analysis.png'))
    plot_wake_analysis(ux, uy, vmag, obstacle, t,
                       os.path.join(outdir, '05_wake_pressure_analysis.png'))
    plot_turbulence_intensity(ux, uy, snapshots, obstacle,
                              os.path.join(outdir, '06_turbulence_intensity.png'))
    create_summary_dashboard(snapshots, obstacle,
                             os.path.join(outdir, '07_full_dashboard.png'))

    print(f"\nAll outputs saved to: {outdir}")
    print("Visualization files generated successfully.")
