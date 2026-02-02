# 🚀 Deploy para GitHub - Meu Auxiliar

## ⚠️ IMPORTANTE: Revogue o token anterior!
Você compartilhou um token publicamente. Por segurança:
1. Acesse: https://github.com/settings/tokens
2. Delete o token antigo
3. Crie um novo token

## 📋 Passo a Passo para Deploy

### 1. Configure o Git (primeira vez apenas)
```bash
git config --global user.name "guilhermevv123"
git config --global user.email "seu-email@exemplo.com"
```

### 2. Inicialize o repositório (se necessário)
```bash
cd c:\Users\tecno\Downloads\meuauxiliar-main\meuauxiliar-main
git init
git branch -M main
```

### 3. Conecte ao repositório remoto
```bash
git remote add origin https://github.com/guilhermevv123/meuauxiliar.git
```
Se já existir, use:
```bash
git remote set-url origin https://github.com/guilhermevv123/meuauxiliar.git
```

### 4. Adicione e commit as mudanças
```bash
git add .
git commit -m "feat: improved UI with iPhone mockup and redesigned pricing"
```

### 5. Faça o push
```bash
git push -u origin main
```

Quando pedir credenciais:
- **Username**: guilhermevv123
- **Password**: Cole seu NOVO token (não a senha do GitHub)

## 🎯 Alternativa: GitHub Desktop
Mais fácil e visual:
1. Abra o GitHub Desktop
2. File → Clone Repository → guilhermevv123/meuauxiliar
3. Copie os arquivos modificados para a pasta clonada
4. Commit e Push pela interface

## 📝 Mudanças neste commit:
- ✅ iPhone mockup cortado com gradient fade
- ✅ Hero section redesenhado
- ✅ Card de preços melhorado
- ✅ Popup de indicação removido
- ✅ Navbar com animações de scroll
- ✅ Responsividade mobile otimizada
