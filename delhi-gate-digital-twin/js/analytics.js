export class Analytics {
  constructor() {
    this.chart = document.getElementById('analytics-chart');
    this.ctx = this.chart.getContext('2d');
    this.speedHistory = [];
    this.countHistory = [];
    this.maxPoints = 60;
  }

  update(stats) {
    this.speedHistory.push(stats.avgSpeed);
    this.countHistory.push(stats.activeCount);
    if (this.speedHistory.length > this.maxPoints) {
      this.speedHistory.shift();
      this.countHistory.shift();
    }
    document.getElementById('analytics-passed').textContent = stats.totalPassed;
    document.getElementById('analytics-wait').textContent = stats.avgWaitTime.toFixed(1) + 's';
    document.getElementById('analytics-throughput').textContent = stats.throughput + ' veh/min';
    this.drawChart();
  }

  drawChart() {
    const { ctx, chart } = this;
    const w = chart.width, h = chart.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    this.drawLine(this.speedHistory, '#64b5f6', 0.3, h);
    this.drawLine(this.countHistory, '#ef5350', 0.15, h);

    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#90a4ae';
    ctx.font = '9px sans-serif';
    ctx.fillText('Speed (km/h)', 16, 12);

    ctx.fillStyle = '#ef5350';
    ctx.fillRect(4, 18, 8, 8);
    ctx.fillStyle = '#90a4ae';
    ctx.fillText('Vehicle Count', 16, 26);
  }

  drawLine(data, color, scale, h) {
    if (data.length < 2) return;
    const { ctx, chart } = this;
    const w = chart.width;
    const step = w / (this.maxPoints - 1);
    const maxVal = Math.max(10, ...data) * scale;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v * scale / maxVal) * (h - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  reset() {
    this.speedHistory = [];
    this.countHistory = [];
    document.getElementById('analytics-passed').textContent = '0';
    document.getElementById('analytics-wait').textContent = '0s';
    document.getElementById('analytics-throughput').textContent = '0 veh/min';
  }
}
