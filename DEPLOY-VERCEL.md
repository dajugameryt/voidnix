# 🚀 Deploy VoidNix na Vercel

## Passo 1: Criar conta na Vercel
1. Vai a https://vercel.com
2. Faz login com GitHub (recomendado)

## Passo 2: Preparar o código
✅ Arquivos de configuração já criados:
- `vercel.json` - Configuração do Vercel
- `.vercelignore` - Ficheiros a ignorar

## Passo 3: Subir código para GitHub
```bash
# Inicializar repositório Git (se ainda não tens)
git init
git add .
git commit -m "Preparar deploy para Vercel"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USER/voidnix.git
git branch -M main
git push -u origin main
```

## Passo 4: Deploy na Vercel
1. Na Vercel, clica em "New Project"
2. Importa o repositório do GitHub
3. Configura as variáveis de ambiente:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `NODE_ENV=production`

4. Deploy automático! 🎉

## Passo 5: Configurar domínio voidnix.pt
1. Na Vercel, vai a Settings > Domains
2. Adiciona `voidnix.pt` e `www.voidnix.pt`
3. Vercel dará os registos DNS
4. Vai à Amen.pt > DNS > Adiciona os registos

## URLs após deploy:
- Frontend: https://voidnix.pt
- Backend API: https://voidnix.pt/api/*

## Próximos passos:
- Atualizar URLs do Stripe
- Configurar webhook do Stripe
- Testar pagamentos
