#!/usr/bin/env bun
import { Database } from "bun:sqlite";
import { writeFileSync } from "node:fs";

// 1. 連接資料庫
const db = new Database("system_monitor.sqlite");

// 2. 抓取最近 100 筆資料
const data: any[] = db.query("SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 100").all();

if (data.length === 0) {
  console.log("❌ 資料庫裡沒半筆資料，先去跑 monitor.ts 吧！");
  process.exit(1);
}

// 為了繪圖，我們要把資料反轉（讓時間軸從左到右）
const chartData = data.reverse();

// 3. 準備 HTML 模板
const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OB2D 2026 系統負載報告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, sans-serif; background: #f4f7f6; padding: 40px; }
        .container { max-width: 900px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .info { text-align: center; color: #666; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 OB2D 系統監控報告</h1>
        <div class="info">主機：${data[0].host} | 資料筆數：${data.length}</div>
        <canvas id="loadChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('loadChart').getContext('2d');
        const data = ${JSON.stringify(chartData)};
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
                datasets: [
                    {
                        label: '1分鐘負載',
                        data: data.map(d => d.load_1min),
                        borderColor: '#ff6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '5分鐘負載',
                        data: data.map(d => d.load_5min),
                        borderColor: '#36a2eb',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Load Average' } }
                }
            }
        });
    </script>
</body>
</html>
`;

// 4. 寫入檔案
writeFileSync("report.html", htmlContent);
console.log("✅ 報表已生成：report.html");
console.log("請在瀏覽器中開啟 report.html 查看統計圖表。");