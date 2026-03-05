# Script de Verificação do Domínio voidnix.pt
# Executa: .\verificar-dominio.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO DOMÍNIO VOIDNIX.PT        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Testar DNS
Write-Host "1. Testando DNS do dominio..." -ForegroundColor Yellow
Write-Host ""

try {
    $dnsResult = Resolve-DnsName -Name "voidnix.pt" -Type A -ErrorAction Stop
    
    if ($dnsResult) {
        Write-Host "OK DNS configurado!" -ForegroundColor Green
        Write-Host "   IP: $($dnsResult.IPAddress)" -ForegroundColor White
        
        if ($dnsResult.IPAddress -eq "76.76.21.21") {
            Write-Host "   OK IP correto (Vercel)!" -ForegroundColor Green
        } else {
            Write-Host "   ALERTA IP incorreto. Esperado: 76.76.21.21" -ForegroundColor Red
            Write-Host "   ALERTA Verificar configuracao DNS na Amen.pt" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "ERRO DNS nao configurado ou nao propagou" -ForegroundColor Red
    Write-Host "   Acao: Verificar registos DNS na Amen.pt" -ForegroundColor Yellow
}

Write-Host ""

# 2. Testar www
Write-Host "2. Testando subdominio www..." -ForegroundColor Yellow
Write-Host ""

try {
    $wwwResult = Resolve-DnsName -Name "www.voidnix.pt" -Type CNAME -ErrorAction Stop
    
    if ($wwwResult) {
        Write-Host "OK WWW configurado!" -ForegroundColor Green
        Write-Host "   CNAME: $($wwwResult.NameHost)" -ForegroundColor White
        
        if ($wwwResult.NameHost -like "*vercel*") {
            Write-Host "   OK CNAME correto (aponta para Vercel)!" -ForegroundColor Green
        } else {
            Write-Host "   ALERTA CNAME pode estar incorreto" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "ALERTA WWW nao configurado" -ForegroundColor Yellow
    Write-Host "   Acao: Adicionar CNAME www aponta para cname.vercel-dns.com" -ForegroundColor Yellow
}

Write-Host ""

# 3. Testar conexao HTTPS
Write-Host "3. Testando conexao HTTPS..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://voidnix.pt" -Method Head -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "OK Site esta acessivel!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   OK Dominio funcionando perfeitamente!" -ForegroundColor Green
    
} catch {
    $errorMsg = $_.Exception.Message
    
    if ($errorMsg -like "*SSL*" -or $errorMsg -like "*certificate*") {
        Write-Host "ALERTA Erro de SSL/Certificado" -ForegroundColor Yellow
        Write-Host "   Acao: Aguardar provisao SSL (5-10 minutos)" -ForegroundColor Yellow
        
    } elseif ($errorMsg -like "*not resolve*" -or $errorMsg -like "*NXDOMAIN*") {
        Write-Host "ERRO DNS nao resolvido" -ForegroundColor Red
        Write-Host "   Acao: Configurar DNS ou aguardar propagacao" -ForegroundColor Yellow
        
    } elseif ($errorMsg -like "*timeout*") {
        Write-Host "ALERTA Timeout na conexao" -ForegroundColor Yellow
        Write-Host "   Acao: Verificar se site esta deployado na Vercel" -ForegroundColor Yellow
        
    } else {
        Write-Host "ERRO ao conectar: $errorMsg" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Testar API
Write-Host "4. Testando API..." -ForegroundColor Yellow
Write-Host ""

try {
    $apiResponse = Invoke-WebRequest -Uri "https://voidnix.pt/api/create-checkout-session" -Method POST -TimeoutSec 10 -ErrorAction Stop
    Write-Host "OK API acessivel!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 405) {
        Write-Host "OK API acessivel (erro esperado sem dados)" -ForegroundColor Green
    } else {
        Write-Host "ALERTA API nao acessivel" -ForegroundColor Yellow
        Write-Host "   Verificar se API esta deployada corretamente" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO                                " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificacoes DNS externas
Write-Host "Para verificar propagacao mundial:" -ForegroundColor Cyan
Write-Host "   https://dnschecker.org/#A/voidnix.pt" -ForegroundColor White
Write-Host ""

Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Se DNS nao configurado - Ver TROUBLESHOOTING-DOMINIO-VERCEL.md" -ForegroundColor White
Write-Host "   2. Se configurado mas nao propagou - Aguardar 10-30 minutos" -ForegroundColor White
Write-Host "   3. Se tudo verde - Dominio funcionando!" -ForegroundColor White
Write-Host ""
