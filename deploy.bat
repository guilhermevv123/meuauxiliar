@echo off
echo ========================================
echo  Deploy para GitHub - Meu Auxiliar
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando Git...
git --version
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado. Feche e reabra o terminal.
    pause
    exit /b 1
)

echo.
echo [2/5] Configurando repositorio...
git remote -v
if %errorlevel% neq 0 (
    echo Adicionando remote...
    git remote add origin https://github.com/guilhermevv123/meuauxiliar.git
)

echo.
echo [3/5] Adicionando arquivos...
git add .

echo.
echo [4/5] Criando commit...
git commit -m "feat: improved UI with iPhone mockup and redesigned pricing

- Added cropped iPhone mockup with gradient fade effect
- Redesigned hero section with overlaid text and CTAs
- Improved pricing card with better visual hierarchy
- Removed referral popup for better conversion
- Fixed navbar scroll animations
- Optimized mobile responsiveness"

echo.
echo [5/5] Enviando para GitHub...
git push -u origin main

echo.
echo ========================================
echo  Deploy concluido com sucesso!
echo ========================================
pause
