#!/usr/bin/env bun

import { Database } from "bun:sqlite";
import { loadavg, hostname } from "node:os";

// 1. 初始化資料庫（如果檔案不存在會自動建立）
const db = new Database("system_monitor.sqlite");

// 2. 建立資料表（如果還沒有的話）
db.run(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    host TEXT,
    load_1min REAL,
    load_5min REAL,
    load_15min REAL
  )
`);

console.log(`[OB2D Monitor] 開始監控 ${hostname()}... (按 Ctrl+C 停止)`);

// 3. 定義寫入邏輯
const insertMetric = db.prepare(`
  INSERT INTO metrics (host, load_1min, load_5min, load_15min)
  VALUES (?, ?, ?, ?)
`);

// 4. 定期執行監控
setInterval(() => {
  const [l1, l5, l15] = loadavg();
  
  // 執行寫入
  insertMetric.run(hostname(), l1, l5, l15);
  
  console.log(`[${new Date().toLocaleTimeString()}] 記錄成功: 1min load = ${l1.toFixed(2)}`);
  
  // 順便查一下目前總共有幾筆資料
  const count: any = db.query("SELECT COUNT(*) as total FROM metrics").get();
  if (count.total % 10 === 0) {
    console.log(`📊 目前資料庫已累積 ${count.total} 筆記錄`);
  }
}, 5000); // 每 5 秒抓一次