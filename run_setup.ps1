# ==========================================================
# Full Environment Setup Script for Advanced Java
# Sets up: Maven, Tomcat 9, and VS Code Extensions
# ==========================================================

Write-Host ">>> [1/5] Checking Java installation..." -ForegroundColor Cyan
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Java is not installed. Please install JDK 11 or above." -ForegroundColor Red
    Exit 1
}

# 1. Create Tools directory
$toolsDir = "C:\Tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Host ">>> Created directory: $toolsDir" -ForegroundColor Green
}

# 2. Download and extract Maven
$mavenPath = "$toolsDir\apache-maven-3.9.6"
if (!(Test-Path $mavenPath)) {
    Write-Host ">>> [2/5] Downloading Apache Maven (Portable)..." -ForegroundColor Cyan
    $mavenZip = "$env:TEMP\maven.zip"
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $mavenZip
    Write-Host ">>> Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $mavenZip -DestinationPath $toolsDir -Force
    Remove-Item $mavenZip -Force
} else {
    Write-Host ">>> [2/5] Apache Maven is already present." -ForegroundColor Green
}

# Add Maven to PATH for current session
$env:Path += ";$mavenPath\bin"

# 3. Download and extract Tomcat 9
$tomcatPath = "$toolsDir\apache-tomcat-9.0.86"
if (!(Test-Path $tomcatPath)) {
    Write-Host ">>> [3/5] Downloading Apache Tomcat 9 (Portable)..." -ForegroundColor Cyan
    $tomcatZip = "$env:TEMP\tomcat9.zip"
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.86/bin/apache-tomcat-9.0.86-windows-x64.zip" -OutFile $tomcatZip
    Write-Host ">>> Extracting Tomcat 9..." -ForegroundColor Cyan
    Expand-Archive -Path $tomcatZip -DestinationPath $toolsDir -Force
    Remove-Item $tomcatZip -Force
} else {
    Write-Host ">>> [3/5] Apache Tomcat 9 is already present." -ForegroundColor Green
}

# 4. Install VS Code Java extensions
Write-Host ">>> [4/5] Installing VS Code Extensions via CLI..." -ForegroundColor Cyan
code --install-extension vscjava.vscode-java-pack --force
code --install-extension redhat.vscode-community-server-connector --force

Write-Host "==================================================" -ForegroundColor Green
Write-Host ">>> Setup Completed Successfully!" -ForegroundColor Green
Write-Host "Tomcat Location: $tomcatPath" -ForegroundColor Yellow
Write-Host "Maven Location:  $mavenPath" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green
