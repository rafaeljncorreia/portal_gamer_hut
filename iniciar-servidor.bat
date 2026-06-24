@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo  Media Downloader - Servidor Local
echo  ===================================
echo.

REM --- Adiciona caminhos comuns ao PATH ---
set "PATH=%PATH%;C:\Program Files\nodejs"
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python314"
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python313"
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python312"
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python311"
set "PATH=%PATH%;C:\Python314;C:\Python313;C:\Python312;C:\Python311"
set "PATH=%PATH%;%~dp0ffmpeg"

REM ── 1. Python ────────────────────────────────────────────────────
echo [1/3] Verificando Python...
python --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=*" %%v in ('python --version') do echo [OK] %%v
    goto ffmpeg
)
echo [..] Baixando Python 3.11...
powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe' -OutFile '%TEMP%\python_setup.exe'"
if not exist "%TEMP%\python_setup.exe" ( echo [ERRO] Falha ao baixar Python. Verifique sua internet. & pause & exit /b 1 )
echo [..] Instalando Python...
"%TEMP%\python_setup.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
ping -n 4 127.0.0.1 >nul
for /f "tokens=*" %%p in ('powershell -Command "[Environment]::GetEnvironmentVariable(\"PATH\",\"Machine\")"') do set "PATH=%%p;%PATH%"
echo [OK] Python instalado

REM ── 2. ffmpeg ────────────────────────────────────────────────────
:ffmpeg
echo.
echo [2/3] Verificando ffmpeg...
ffmpeg -version >nul 2>&1
if not errorlevel 1 ( echo [OK] ffmpeg ja instalado & goto ytdlp )
if exist "%~dp0ffmpeg\ffmpeg.exe" ( echo [OK] ffmpeg local encontrado & goto ytdlp )

echo [..] Baixando ffmpeg...
powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/BtbN/ffmpeg-builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' -OutFile '%TEMP%\ffmpeg.zip'"
if not exist "%TEMP%\ffmpeg.zip" (
    echo [AVISO] Falha ao baixar ffmpeg. Downloads funcionarao sem alta qualidade.
    goto ytdlp
)
echo [..] Extraindo ffmpeg...
powershell -Command "Expand-Archive -Path '%TEMP%\ffmpeg.zip' -DestinationPath '%TEMP%\ffmpeg_ex' -Force"
if not exist "%~dp0ffmpeg" mkdir "%~dp0ffmpeg"
for /d %%d in ("%TEMP%\ffmpeg_ex\*") do xcopy /e /y /q "%%d\bin\*" "%~dp0ffmpeg\" >nul 2>&1
set "PATH=%~dp0ffmpeg;%PATH%"
echo [OK] ffmpeg instalado

REM ── 3. yt-dlp ────────────────────────────────────────────────────
:ytdlp
echo.
echo [3/3] Verificando yt-dlp...
python -c "import yt_dlp" >nul 2>&1
if not errorlevel 1 ( echo [OK] yt-dlp ja instalado & goto start )
echo [..] Instalando yt-dlp...
python -m pip install yt-dlp --quiet --disable-pip-version-check
echo [OK] yt-dlp instalado

REM ── Inicia servidor ───────────────────────────────────────────────
:start
echo.
echo  ===================================
echo  Servidor iniciando em
echo  http://127.0.0.1:8765
echo  Mantenha esta janela aberta!
echo  ===================================
echo.
python "%~dp0server.py"
pause
