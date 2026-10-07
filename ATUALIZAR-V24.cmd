@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo TM21 - Publicacao da V24
echo Execute este arquivo somente dentro do repositorio existente, apos copiar os arquivos da V24.
git status
if errorlevel 1 goto erro
git add .
if errorlevel 1 goto erro
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Atualiza pagina do RS e navegacao do rodape para V24"
  if errorlevel 1 goto erro
) else (
  echo Nenhuma alteracao nova para commit.
)
git push
if errorlevel 1 goto erro
echo.
echo Envio concluido. Aguarde o deploy da Vercel e confira o site.
pause
exit /b 0
:erro
echo.
echo O Git retornou um erro. Confira a mensagem acima antes de continuar.
pause
exit /b 1
