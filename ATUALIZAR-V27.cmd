@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo TM21 - PUBLICACAO V27
echo ==========================================
echo.

if exist "ATUALIZAR-V24.cmd" del /q "ATUALIZAR-V24.cmd"
if exist "ATUALIZAR-V25.cmd" del /q "ATUALIZAR-V25.cmd"

echo [1/4] Status atual:
git status
if errorlevel 1 goto :erro

echo.
echo [2/4] Adicionando alteracoes...
git add .
if errorlevel 1 goto :erro

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo Nenhuma alteracao nova para commit.
  goto :push
)

echo.
echo [3/4] Criando commit V27...
git commit -m "Atualiza pagina Brasil, heroes regionais e performance para V27"
if errorlevel 1 goto :erro

:push
echo.
echo [4/4] Enviando para o GitHub...
git push
if errorlevel 1 goto :erro

echo.
echo ==========================================
echo V27 enviada. Aguarde o deploy da Vercel.
echo Depois confira home, Brasil, RS, SC e privacidade.
echo ==========================================
goto :fim

:erro
echo.
echo ERRO: o processo foi interrompido. Leia a mensagem do Git acima.

:fim
echo.
pause
endlocal
