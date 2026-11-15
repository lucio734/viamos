# Exporta docs/producao-tecnica/Viamos_Producao_Tecnica.docx para PDF com o Microsoft Word (Windows).
# O Word mantém o layout exato do .docx (seções em paisagem, legendas e tabelas).
#
# Uso (na raiz do repositório):
#   powershell -ExecutionPolicy Bypass -File docs/producao-tecnica/build/exportar_pdf.ps1
$ErrorActionPreference = 'Stop'
# [string]: a saída do Join-Path vem embrulhada num PSObject, que o Word recebe como referência COM em vez de texto;
# com isso a exportação fica parada por muitos minutos. Texto puro exporta em segundos.
$pasta = [string](Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$docx = [string](Join-Path $pasta 'Viamos_Producao_Tecnica.docx')
$pdf = [string](Join-Path $pasta 'Viamos_Producao_Tecnica.pdf')
if (-not (Test-Path $docx)) { throw "Documento não encontrado: $docx (rode antes gerar_docx.py)" }
$relogio = [Diagnostics.Stopwatch]::StartNew()
"docx: $docx"
"pdf:  $pdf"

$word = New-Object -ComObject Word.Application
"[{0:N0}s] Word iniciado" -f $relogio.Elapsed.TotalSeconds
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $documento = $word.Documents.Open($docx, $false, $true)  # sem confirmar conversão, somente leitura
  "[{0:N0}s] documento aberto" -f $relogio.Elapsed.TotalSeconds
  $documento.ExportAsFixedFormat($pdf, 17)                  # 17 = wdExportFormatPDF
  "[{0:N0}s] PDF exportado" -f $relogio.Elapsed.TotalSeconds
  $paginas = $documento.ComputeStatistics(2)                # 2 = wdStatisticPages
  $documento.Close(0)
} finally {
  $word.Quit()
  [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}
'{0}: {1} páginas, {2:N1} MB' -f (Split-Path $pdf -Leaf), $paginas, ((Get-Item $pdf).Length / 1MB)
