import pandas as pd
import plotly.graph_objects as go
import plotly.express as px

# Data Enrichment
data = [
    {"Date": "2022-07-28", "Event": "Intro Email", "Type": "Communication", "Impact": "Low"},
    {"Date": "2022-10-11", "Event": "Demo Requested", "Type": "Discussion", "Impact": "Medium"},
    {"Date": "2022-10-17", "Event": "Demo Conducted", "Type": "Meeting", "Impact": "High"},
    {"Date": "2022-10-21", "Event": "Proposal/MOU", "Type": "Documentation", "Impact": "High"},
    {"Date": "2022-12-15", "Event": "Requirements", "Type": "Planning", "Impact": "Medium"},
    {"Date": "2023-01-13", "Event": "Procurement Docs", "Type": "Documentation", "Impact": "Medium"},
    {"Date": "2023-02-08", "Event": "Bid Placed", "Type": "Procurement", "Impact": "High"},
    {"Date": "2023-03-01", "Event": "Order Received", "Type": "Procurement", "Impact": "High"},
    {"Date": "2023-03-06", "Event": "CCoE Ready", "Type": "Implementation", "Impact": "High"},
    {"Date": "2023-03-10", "Event": "Training", "Type": "Implementation", "Impact": "Medium"},
    {"Date": "2023-03-13", "Event": "Invoiced", "Type": "Financial", "Impact": "Medium"},
    {"Date": "2023-03-14", "Event": "Payment Held", "Type": "Financial", "Impact": "Critical"}
]

df = pd.DataFrame(data)
df['Date'] = pd.to_datetime(df['Date'])

# Charts
# 1. Timeline
fig_timeline = px.scatter(df, x="Date", y="Type", color="Impact", size=[10]*len(df), hover_data=["Event"], title="Project Timeline & Activity Impact")

# 2. Activity Distribution
fig_activity = px.pie(df, names='Type', title='Activity Distribution')

# 3. Status Summary
total_days = (df['Date'].max() - df['Date'].min()).days
issues = df[df['Impact'] == 'Critical']

# HTML construction with Bootstrap
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>NIT Delhi CCoE 360 Dashboard</title>
</head>
<body class="bg-light">
    <div class="container py-4">
        <h1 class="mb-4">NIT Delhi CCoE 360 View</h1>
        
        <div class="row mb-4">
            <div class="col-md-4"><div class="card p-3 shadow-sm"><h5>Total Duration</h5><p class="h3">{total_days} days</p></div></div>
            <div class="col-md-4"><div class="card p-3 shadow-sm"><h5>Total Activities</h5><p class="h3">{len(df)}</p></div></div>
            <div class="col-md-4"><div class="card p-3 shadow-sm text-danger"><h5>Critical Blockers</h5><p class="h3">{len(issues)}</p></div></div>
        </div>

        <div class="row">
            <div class="col-md-8"><div class="card p-3 shadow-sm">{fig_timeline.to_html(full_html=False, include_plotlyjs='cdn')}</div></div>
            <div class="col-md-4"><div class="card p-3 shadow-sm">{fig_activity.to_html(full_html=False, include_plotlyjs='cdn')}</div></div>
        </div>
        
        <div class="card mt-4 p-3 shadow-sm">
            <h3>Recent Blockers/Actions</h3>
            <ul class="list-group">
                {"".join([f'<li class="list-group-item text-danger">{row["Date"].strftime("%Y-%m-%d")} - {row["Event"]}</li>' for _, row in issues.iterrows()])}
            </ul>
        </div>
    </div>
    <footer style="text-align:center;padding:12px;margin-top:24px;opacity:0.5;font-size:11px;font-family:system-ui;color:#666;">
        <a href="https://nebulacloud.studio" style="color:#3b82f6;text-decoration:none;">Built with NebulaCloud Studio</a>
    </footer>
</body>
</html>
"""

with open("dashboard.html", "w") as f:
    f.write(html_content)
print("Enhanced dashboard generated: dashboard.html")
