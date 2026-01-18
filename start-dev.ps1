# Script para iniciar ambiente de desenvolvimento
Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Green

# Verificar se as portas estão livres
$backendPort = 8000
$frontendPort = 8080

Write-Host "`n📋 Verificando portas..." -ForegroundColor Cyan
$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue

if ($backendInUse) {
    Write-Host "⚠️  Porta $backendPort já está em uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta $backendPort livre" -ForegroundColor Green
}

if ($frontendInUse) {
    Write-Host "⚠️  Porta $frontendPort já está em uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta $frontendPort livre" -ForegroundColor Green
}

# Iniciar backend
Write-Host "`n🔧 Iniciando backend (porta $backendPort)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; python -m uvicorn backend.app_secure:app --reload --port $backendPort"

Start-Sleep -Seconds 2

# Iniciar frontend
Write-Host "🌐 Iniciando frontend (porta $frontendPort)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; python -m http.server $frontendPort"

Start-Sleep -Seconds 2

Write-Host "`n✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "`n📱 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "   • Dashboard Admin: http://localhost:8080/admin-dashboard/index.html" -ForegroundColor White
Write-Host "   • App Premium: http://localhost:8080/app-premium.html" -ForegroundColor White
Write-Host "   • Login: http://localhost:8080/login.html" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   • Documentação API: http://localhost:8000/docs" -ForegroundColor White

Write-Host "`n🔐 Credenciais padrão:" -ForegroundColor Yellow
Write-Host "   Email: admin@empresa.com" -ForegroundColor White
Write-Host "   Senha: Admin@2025!ChangeMe" -ForegroundColor White
Write-Host "   ⚠️  ALTERE A SENHA APÓS PRIMEIRO LOGIN!" -ForegroundColor Red

Write-Host "`n💡 Dica: Pressione Ctrl+C nas janelas dos terminais para parar os servidores`n" -ForegroundColor Gray
