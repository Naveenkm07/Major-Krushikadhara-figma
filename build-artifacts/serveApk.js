import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { exec, execSync } from "node:child_process"

const PORT = 8088
const APK_PATH = path.resolve(process.cwd(), "build-artifacts", "KrushikaDhara-release-v1.0.0.apk")
const APK_STAT = fs.existsSync(APK_PATH) ? fs.statSync(APK_PATH) : null

let lastAdbStatus = "Scanning for connected devices..."
let autoInstalled = false

function checkAdbDevices() {
  exec("adb devices", (err, stdout) => {
    if (err) {
      lastAdbStatus = "ADB error: " + err.message
      return
    }
    const lines = stdout.split("\n").map((l) => l.trim()).filter(Boolean)
    const devices = lines.slice(1).filter((l) => !l.startsWith("*") && l.includes("device"))
    if (devices.length > 0) {
      const devId = devices[0].split(/\s+/)[0]
      lastAdbStatus = `Device connected: ${devId}`
      if (!autoInstalled && fs.existsSync(APK_PATH)) {
        console.log(`📱 Found connected Android device: ${devId}. Auto-installing APK...`)
        autoInstalled = true
        exec(`adb install -r "${APK_PATH}"`, (installErr, installOut) => {
          if (installErr) {
            console.error("❌ ADB install error:", installErr.message)
            lastAdbStatus = `Install failed on ${devId}: ${installErr.message}`
          } else {
            console.log(`✅ ADB install success on ${devId}!`, installOut.trim())
            lastAdbStatus = `Installed successfully on ${devId}! Launching app...`
            exec(`adb shell am start -n com.krushikadhara/.MainActivity`, () => {
              console.log("🚀 KrushikaDhara launched on mobile device!")
            })
          }
        })
      }
    } else {
      lastAdbStatus = "No USB/Wi-Fi device attached to ADB currently. Use direct APK download below or plug in USB cable."
      autoInstalled = false
    }
  })
}

setInterval(checkAdbDevices, 3000)
checkAdbDevices()

const server = http.createServer((req, res) => {
  const url = req.url || "/"

  if (url === "/krushikadhara.apk" || url === "/KrushikaDhara-release-v1.0.0.apk" || url === "/download") {
    if (!fs.existsSync(APK_PATH)) {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("APK file not found on server.")
      return
    }
    const stat = fs.statSync(APK_PATH)
    res.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Length": stat.size,
      "Content-Disposition": 'attachment; filename="KrushikaDhara-release-v1.0.0.apk"',
      "Cache-Control": "no-cache",
    })
    const stream = fs.createReadStream(APK_PATH)
    stream.pipe(res)
    return
  }

  if (url === "/api/adb-status") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: lastAdbStatus }))
    return
  }

  if (url === "/api/trigger-adb-install") {
    exec(`adb install -r "${APK_PATH}"`, (err, stdout) => {
      res.writeHead(200, { "Content-Type": "application/json" })
      if (err) {
        res.end(JSON.stringify({ success: false, error: err.message }))
      } else {
        exec(`adb shell am start -n com.krushikadhara/.MainActivity`)
        res.end(JSON.stringify({ success: true, message: stdout.trim() }))
      }
    })
    return
  }

  // HTML UI
  const sizeMB = APK_STAT ? (APK_STAT.size / (1024 * 1024)).toFixed(1) : "74.6"
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KrushikaDhara (ಕೃಷಿಕಧಾರ) APK Install</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Kannada:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .kannada { font-family: 'Noto Sans Kannada', sans-serif; }
  </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 min-h-screen text-slate-100 p-4 sm:p-8 flex items-center justify-center">
  <div class="max-w-md w-full bg-slate-800/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
    <div class="text-center mb-6">
      <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-3 border-2 border-emerald-300">
        <span class="text-4xl">🌾</span>
      </div>
      <h1 class="text-2xl font-extrabold text-white tracking-tight">KrushikaDhara</h1>
      <p class="text-emerald-400 font-semibold text-sm kannada">ಕೃಷಿಕಧಾರ • ಕರ್ನಾಟಕ ಕೃಷಿ ವೇದಿಕೆ</p>
      <div class="inline-block bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold mt-2 border border-emerald-500/40">
        v1.0.0 Release • Android APK
      </div>
    </div>

    <!-- Download Card -->
    <div class="bg-slate-900/80 rounded-2xl p-5 border border-slate-700 mb-6 space-y-4">
      <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>File Name</span>
        <span class="text-slate-200 font-mono font-medium">KrushikaDhara-v1.0.0.apk</span>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>File Size</span>
        <span class="text-emerald-400 font-bold">${sizeMB} MB</span>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>Package</span>
        <span class="text-slate-200 font-mono">com.krushikadhara</span>
      </div>

      <a href="/krushikadhara.apk" download="KrushikaDhara-release-v1.0.0.apk"
        class="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-900/60 transition transform hover:-translate-y-0.5 active:translate-y-0 border border-emerald-300/40 text-base">
        📥 Download & Install APK (${sizeMB} MB)
      </a>
      <p class="text-[11px] text-center text-slate-400 kannada">ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ನಂತರ ಫೈಲ್ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.</p>
    </div>

    <!-- ADB Live Status -->
    <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-6 text-xs">
      <div class="flex items-center justify-between mb-1.5">
        <span class="font-bold text-slate-300 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          USB / ADB Auto-Installer
        </span>
        <button onclick="checkAdb()" class="text-emerald-400 hover:underline text-[11px]">Refresh</button>
      </div>
      <p id="adbStatusText" class="text-slate-400 font-mono text-[11px] leading-relaxed break-words">${lastAdbStatus}</p>
    </div>

    <!-- Installation Steps -->
    <div class="space-y-3 text-xs text-slate-300">
      <h3 class="font-bold text-slate-200 uppercase tracking-wider text-[10px]">How to Install on Phone:</h3>
      <ol class="space-y-2 list-decimal list-inside text-slate-400">
        <li>Tap the green <strong class="text-emerald-300">Download & Install APK</strong> button above.</li>
        <li>Once downloaded, tap the notification or open your phone's <strong class="text-white">Downloads</strong> folder.</li>
        <li>Tap <strong class="text-white">KrushikaDhara-release-v1.0.0.apk</strong>.</li>
        <li>If prompted with <em>"Install unknown apps"</em>, toggle <strong class="text-emerald-400">Allow from this source</strong>.</li>
        <li>Tap <strong class="text-emerald-400">Install</strong> and enjoy KrushikaDhara!</li>
      </ol>
    </div>
  </div>

  <script>
    async function checkAdb() {
      try {
        const res = await fetch('/api/adb-status');
        const data = await res.json();
        document.getElementById('adbStatusText').textContent = data.status;
      } catch (e) {}
    }
    setInterval(checkAdb, 2500);
  </script>
</body>
</html>`

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
  res.end(html)
})

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KrushikaDhara APK Installer server live on:`)
  console.log(`   Local:   http://localhost:${PORT}`)
  console.log(`   Mobile:  http://10.249.124.75:${PORT}`)
  console.log(`   APK:     http://10.249.124.75:${PORT}/krushikadhara.apk`)
})

