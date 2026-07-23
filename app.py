import io
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from flask import Flask, jsonify, send_file

app = Flask(__name__)

# ── Generate realistic retail sales dataset ──────────────────────────────────

np.random.seed(42)

products = {
    "Laptop Pro":       {"category": "Electronics", "base_price": 1200, "volume": 15},
    "Wireless Earbuds": {"category": "Electronics", "base_price": 150,  "volume": 80},
    "Smart Watch":      {"category": "Electronics", "base_price": 350,  "volume": 40},
    "Denim Jacket":     {"category": "Clothing",    "base_price": 85,   "volume": 50},
    "Running Shoes":    {"category": "Clothing",    "base_price": 120,  "volume": 60},
    "Cotton T-Shirt":   {"category": "Clothing",    "base_price": 30,   "volume": 120},
    "Desk Lamp":        {"category": "Home",        "base_price": 45,   "volume": 35},
    "Coffee Maker":     {"category": "Home",        "base_price": 90,   "volume": 30},
}

regions = ["North", "South", "East", "West"]
region_weights = {"North": 1.0, "South": 0.8, "East": 1.2, "West": 0.9}

date_range = pd.date_range("2024-01-01", "2025-12-31", freq="D")
records = []

for date in date_range:
    day_of_week = date.dayofweek
    month = date.month
    is_holiday = month == 12 or (month == 11 and date.day > 20) or (month == 7 and date.day < 8)

    for product_name, info in products.items():
        for region in regions:
            base = info["volume"]

            dow_factor = 0.6 if day_of_week in (0, 6) else 1.0
            holiday_factor = 1.8 if is_holiday else 1.0
            seasonal = 1.0 + 0.15 * np.sin(2 * np.pi * (month - 1) / 12)

            if product_name == "Denim Jacket" and month in (10, 11, 12, 1, 2):
                seasonal *= 1.5
            if product_name == "Running Shoes" and month in (3, 4, 5):
                seasonal *= 1.3
            if product_name == "Coffee Maker" and month in (11, 12):
                seasonal *= 1.7

            volume = int(np.random.poisson(base * region_weights[region] * dow_factor * holiday_factor * seasonal))
            volume = max(0, volume)

            price = info["base_price"] * (0.85 + 0.3 * np.random.random())
            revenue = round(volume * price, 2)

            segment = np.random.choice(["New", "Regular", "VIP"], p=[0.3, 0.55, 0.15])

            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "product": product_name,
                "category": info["category"],
                "region": region,
                "units_sold": volume,
                "unit_price": round(price, 2),
                "revenue": revenue,
                "customer_segment": segment,
            })

df = pd.DataFrame(records)
df["date"] = pd.to_datetime(df["date"])
df["month"] = df["date"].dt.to_period("M")
df["year"] = df["date"].dt.year

# ── Analysis 1: Monthly revenue trend ────────────────────────────────────────

monthly_revenue = (
    df.groupby("month")["revenue"]
    .sum()
    .reset_index()
)
monthly_revenue["month_str"] = monthly_revenue["month"].astype(str)
monthly_revenue["moving_avg_3"] = monthly_revenue["revenue"].rolling(3, min_periods=1).mean().round(2)
monthly_revenue["yoy_growth_pct"] = (
    monthly_revenue["revenue"]
    .pct_change(12)
    .mul(100)
    .round(1)
    .fillna(0)
)

# ── Analysis 2: Product performance ──────────────────────────────────────────

product_perf = (
    df.groupby("product")
    .agg(revenue=("revenue", "sum"), units=("units_sold", "sum"))
    .sort_values("revenue", ascending=False)
    .reset_index()
)
product_perf["revenue_pct"] = (product_perf["revenue"] / product_perf["revenue"].sum() * 100).round(1)

# ── Analysis 3: Category breakdown ───────────────────────────────────────────

category_perf = (
    df.groupby("category")
    .agg(revenue=("revenue", "sum"))
    .reset_index()
)
category_perf["revenue_pct"] = (category_perf["revenue"] / category_perf["revenue"].sum() * 100).round(1)

# ── Analysis 4: Regional performance ─────────────────────────────────────────

region_perf = (
    df.groupby("region")
    .agg(revenue=("revenue", "sum"), units=("units_sold", "sum"))
    .reset_index()
)

# ── Analysis 5: Customer segmentation (K-Means) ──────────────────────────────

customer_agg = (
    df.groupby("customer_segment")
    .agg(
        total_revenue=("revenue", "sum"),
        avg_order_value=("revenue", "mean"),
        total_orders=("units_sold", "sum"),
    )
    .reset_index()
)

# Also cluster products by revenue and volume
X = product_perf[["revenue", "units"]].values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
product_perf["cluster"] = kmeans.fit_predict(X_scaled)
cluster_labels = {0: "Star Product", 1: "Core Product", 2: "Niche Product"}
remap = {}
for c in range(3):
    avg_rev = product_perf[product_perf["cluster"] == c]["revenue"].mean()
    remap[c] = avg_rev
sorted_clusters = sorted(remap, key=remap.get, reverse=True)
label_map = {sorted_clusters[0]: "Star Product", sorted_clusters[1]: "Core Product", sorted_clusters[2]: "Niche Product"}
product_perf["segment"] = product_perf["cluster"].map(label_map)

# ── Analysis 6: Monthly revenue by category (stacked) ────────────────────────

monthly_category = (
    df.groupby(["month", "category"])["revenue"]
    .sum()
    .reset_index()
)
monthly_category["month_str"] = monthly_category["month"].astype(str)

# ── Analysis 7: Region-Product heatmap data ──────────────────────────────────

region_product = (
    df.groupby(["region", "product"])["revenue"]
    .sum()
    .reset_index()
)

# ── Summary stats ────────────────────────────────────────────────────────────

total_revenue = float(df["revenue"].sum())
total_units = int(df["units_sold"].sum())
avg_order_value = round(total_revenue / total_units, 2)
total_orders = len(df)
yoy_growth = float(
    (df[df["year"] == 2025]["revenue"].sum() / df[df["year"] == 2024]["revenue"].sum() - 1) * 100
)

summary = {
    "total_revenue": round(total_revenue, 2),
    "total_units": total_units,
    "avg_order_value": avg_order_value,
    "total_transactions": total_orders,
    "yoy_growth_pct": round(yoy_growth, 1),
    "top_product": product_perf.iloc[0]["product"],
    "top_region": region_perf.sort_values("revenue", ascending=False).iloc[0]["region"],
}

# ── API Endpoints ────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_file("dashboard.html")

@app.route("/api/summary")
def api_summary():
    return jsonify(summary)

@app.route("/api/monthly-revenue")
def api_monthly_revenue():
    return jsonify(monthly_revenue.to_dict(orient="records"))

@app.route("/api/product-performance")
def api_product_performance():
    return jsonify(product_perf.to_dict(orient="records"))

@app.route("/api/category-breakdown")
def api_category_breakdown():
    return jsonify(category_perf.to_dict(orient="records"))

@app.route("/api/region-performance")
def api_region_performance():
    return jsonify(region_perf.to_dict(orient="records"))

@app.route("/api/customer-segments")
def api_customer_segments():
    return jsonify(customer_agg.to_dict(orient="records"))

@app.route("/api/monthly-category")
def api_monthly_category():
    return jsonify(monthly_category.to_dict(orient="records"))

@app.route("/api/region-product")
def api_region_product():
    return jsonify(region_product.to_dict(orient="records"))

if __name__ == "__main__":
    print(f"Dataset generated: {len(df):,} records | Total Revenue: ${total_revenue:,.0f}")
    app.run(debug=True, port=5050)
