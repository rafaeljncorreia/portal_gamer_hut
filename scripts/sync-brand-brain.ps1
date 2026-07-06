<#
.SYNOPSIS
  Sincroniza o cérebro de marca da raiz para app-web/public.
  Copia: config.js, generation-context.js, brand-voice.js, catalog.json
  catalog.js NÃO é copiado (diverge intencionalmente: path relativo vs absoluto).
  Uso: .\scripts\sync-brand-brain.ps1
#>

$ErrorActionPreference = 'Stop'
$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$dupDir  = Join-Path $rootDir 'app-web\public'

$files = @('config.js','generation-context.js','brand-voice.js','catalog.json')
Write-Host "=== sync-brand-brain ==="
foreach ($f in $files) {
  $src = Join-Path $rootDir $f
  $dst = Join-Path $dupDir $f
  Copy-Item -LiteralPath $src -Destination $dst -Force
  Write-Host "  [OK] $f copiado"
}
Write-Host "Concluido. catalog.js nao foi copiado (divergencia intencional)."
