#!/usr/bin/env bun

import { hostname, arch, platform, totalmem } from "node:os";

/**
 * OB2D 2026 系統自我檢測工具
 * 這是一個標準的 TS 腳本範例
 */
const getSystemStats = (): void => {
  const host = hostname();
  const memoryGB = (totalmem() / 1024 / 1024 / 1024).toFixed(2);
  
  console.log("-----------------------------------------");
  console.log(`[OB2D 2026] 系統診斷腳本 (TS 版)`);
  console.log(`主機名稱: ${host}`);
  console.log(`系統架構: ${arch()}`);
  console.log(`作業平台: ${platform()}`);
  console.log(`總記憶體: ${memoryGB} GB`);
  console.log("-----------------------------------------");
  
  if (platform() === "linux") {
    console.log("✅ 運行於標準 Linux 環境");
  }
};

getSystemStats();