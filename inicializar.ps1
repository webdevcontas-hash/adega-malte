# Inicializar Adega do Japa v2
Set-Location $PSScriptRoot

Write-Host "Iniciando Adega do Japa v2..." -ForegroundColor Cyan

# Abre o browser apos 4 segundos (tempo para o Next.js subir)
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:3000"
} | Out-Null

npm run dev
