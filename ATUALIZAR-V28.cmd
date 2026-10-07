@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo TM21 - PUBLICACAO V28
echo ==========================================
echo.

for %%F in (ATUALIZAR-V24.cmd ATUALIZAR-V25.cmd ATUALIZAR-V26.cmd ATUALIZAR-V27.cmd) do (
  if exist "%%F" del /q "%%F"
)

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
echo [3/4] Criando commit V28...
git commit -m "Otimiza performance mobile da home para V28"
if errorlevel 1 goto :erro

:push
echo.
echo [4/4] Enviando para o GitHub...
git push
if errorlevel 1 goto :erro

echo.
echo ==========================================
echo V28 enviada. Aguarde o deploy da Vercel.
echo Depois rode novamente o PageSpeed da HOME.
echo Confira principalmente mobile, hero e imagens.
echo ==========================================
goto :fim

:erro
echo.
echo ERRO: o processo foi interrompido. Leia a mensagem do Git acima.

:fim
echo.
pause
endlocal
