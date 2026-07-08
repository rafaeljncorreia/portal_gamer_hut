<#
.SYNOPSIS
  Sincroniza o cérebro de marca + Creative Studio da raiz para app-web/public.
  Copia: config.js, generation-context.js, brand-voice.js, catalog.json,
         studio.html, app/*.jsx, assets/*.png
  catalog.js NÃO é copiado (diverge intencionalmente: path relativo vs absoluto).
  Uso: .\scripts\sync-brand-brain.ps1
#>

$ErrorActionPreference = 'Stop'
$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$dupDir  = Join-Path $rootDir 'app-web\public'

# ── Cérebro de marca ──
$files = @('config.js','generation-context.js','brand-voice.js','catalog.json')
Write-Host "=== sync-brand-brain ==="
foreach ($f in $files) {
  $src = Join-Path $rootDir $f
  $dst = Join-Path $dupDir $f
  Copy-Item -LiteralPath $src -Destination $dst -Force
  Write-Host "  [OK] $f copiado"
}

# ── Creative Studio (Bug #2) ──
$studioHtml = Join-Path $rootDir 'studio.html'
$studioDst  = Join-Path $dupDir 'studio.html'
Copy-Item -LiteralPath $studioHtml -Destination $studioDst -Force
Write-Host "  [OK] studio.html copiado"

# app/*.jsx
$appSrc = Join-Path $rootDir 'app'
$appDst = Join-Path $dupDir 'app'
if (-not (Test-Path -LiteralPath $appDst)) { New-Item -ItemType Directory -Path $appDst -Force | Out-Null }
Get-ChildItem -LiteralPath $appSrc -Filter '*.jsx' | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $appDst $_.Name) -Force
  Write-Host "  [OK] app/$($_.Name) copiado"
}

# assets/*.png
$assetsSrc = Join-Path $rootDir 'assets'
$assetsDst = Join-Path $dupDir 'assets'
if (-not (Test-Path -LiteralPath $assetsDst)) { New-Item -ItemType Directory -Path $assetsDst -Force | Out-Null }
Get-ChildItem -LiteralPath $assetsSrc -Filter '*.png' | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $assetsDst $_.Name) -Force
  Write-Host "  [OK] assets/$($_.Name) copiado"
}

Write-Host "Concluido. catalog.js nao foi copiado (divergencia intencional)."
