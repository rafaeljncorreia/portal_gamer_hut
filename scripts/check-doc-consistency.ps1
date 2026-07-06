<#
.SYNOPSIS
  Valida consistência da documentação do Portal Gamer Hut.
  Exit code 0 = tudo ok. Exit code 1 = divergência encontrada.
.DESCRIPTION
  Verifica:
   1. Cérebro de marca: arquivos raiz idênticos aos de app-web/public/
   2. Sanidade: AGENT-PLAYBOOK.md presente com seções esperadas
  Uso: .\scripts\check-doc-consistency.ps1
#>

$ErrorActionPreference = 'Stop'
$rootDir  = Resolve-Path (Join-Path $PSScriptRoot '..')
$dupDir   = Join-Path $rootDir 'app-web\public'
$hasError = $false

function Check-File {
  param($Name, $RootPath, $DupPath)
  if (-not (Test-Path $RootPath)) { Write-Host "  [ERRO] $Name nao existe na raiz: $RootPath"; return $false }
  if (-not (Test-Path $DupPath))  { Write-Host "  [ERRO] $Name nao existe em app-web/public: $DupPath"; return $false }
  $diff = Compare-Object (Get-Content $RootPath) (Get-Content $DupPath)
  if ($diff) {
    Write-Host "  [ERRO] $Name divergente entre raiz e app-web/public"
    $diff | Group-Object SideIndicator | ForEach-Object {
      $label = if ($_.Group[0].SideIndicator -eq '=>') { 'só em raiz' } else { 'só em dup' }
      Write-Host "    $($label): $($_.Count) linha(s)"
    }
    return $false
  }
  Write-Host "  [OK] $Name identico"
  return $true
}

Write-Host "=== check-doc-consistency ==="
Write-Host ""

# --- 1. Cérebro de marca: arquivos que DEVEM ser idênticos ---
Write-Host "--- Cerebro de marca (raiz vs app-web/public) ---"
$checkFiles = @('config.js','generation-context.js','brand-voice.js','catalog.json')
foreach ($f in $checkFiles) {
  $r = Join-Path $rootDir $f
  $d = Join-Path $dupDir $f
  if (-not (Check-File $f $r $d)) { $hasError = $true }
}

# catalog.js intencionalmente diverge (path relativo vs absoluto)
$r = Join-Path $rootDir 'catalog.js'
$d = Join-Path $dupDir 'catalog.js'
if (-not (Test-Path $r)) { Write-Host "  [ERRO] catalog.js nao existe na raiz"; $hasError = $true; exit 1 }
if (-not (Test-Path $d)) { Write-Host "  [ERRO] catalog.js nao existe em app-web/public"; $hasError = $true; exit 1 }
$rc = (Get-Content $r) -join "`n"
$dc = (Get-Content $d) -join "`n"
if ($rc -eq $dc) {
  Write-Host "  [ALERTA] catalog.js identico - esperava divergencia intencional (path relativo vs absoluto)"
} else {
  Write-Host "  [OK] catalog.js diverge intencionalmente (path relativo raiz vs absoluto app-web)"
}

Write-Host ""

# --- 2. Sanidade dos documentos ---
Write-Host "--- Sanidade dos documentos ---"
$playbook = Join-Path $rootDir 'AGENT-PLAYBOOK.md'
if (-not (Test-Path $playbook)) {
  Write-Host "  [ERRO] AGENT-PLAYBOOK.md nao encontrado"
  $hasError = $true
} else {
  $pb = Get-Content $playbook -Raw
  $expectedSections = @('REGRAS DE OURO','SENTIMENTOS DA MARCA','CHECKLIST DE QA')
  foreach ($sec in $expectedSections) {
    if ($pb -match $sec) { Write-Host "  [OK] AGENT-PLAYBOOK.md contem secao: $sec" }
    else { Write-Host "  [ERRO] AGENT-PLAYBOOK.md nao contem secao esperada: $sec"; $hasError = $true }
  }
}

Write-Host ""

# --- 3. Fontes nas HTML: nenhuma referência a fontes antigas ---
Write-Host "--- Fontes nas HTML (sem Archivo/Space Grotesk/Space Mono) ---"
$htmlFiles = @('index.html','studio.html','criar.html','aprendizado.html','review.html','downloader.html')
$oldFonts = @('Archivo','Space Grotesk','Space Mono')
foreach ($hf in $htmlFiles) {
  $path = Join-Path $rootDir $hf
  if (-not (Test-Path $path)) { Write-Host "  [ALERTA] $hf nao encontrado"; continue }
  $content = Get-Content $path -Raw
  $found = $false
  foreach ($of in $oldFonts) {
    if ($content -match $of) {
      Write-Host "  [ERRO] $hf contem referencia a fonte antiga: $of"
      $found = $true; $hasError = $true
    }
  }
  if (-not $found) { Write-Host "  [OK] $hf sem fontes antigas" }
}

Write-Host ""

# --- Resultado ---
if ($hasError) {
  Write-Host "RESULTADO: DIVERGENCIAS ENCONTRADAS"
  exit 1
} else {
  Write-Host "RESULTADO: TUDO OK"
  exit 0
}
