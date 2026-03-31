$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$file = Join-Path $PSScriptRoot "..\公司配抄專用\切紙機-薄磅用.xlsx"
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.DisplayAlerts = $false
    $wb = $excel.Workbooks.Open($file)
    $ws = $wb.Worksheets.Item(1)
    $rows = $ws.UsedRange.Rows.Count
    $cols = $ws.UsedRange.Columns.Count

    for ($i = 1; $i -le $rows; $i++) {
        $line = ""
        for ($j = 1; $j -le $cols; $j++) {
            $cell = $ws.Cells.Item($i, $j)
            if ($cell -ne $null) {
                $line += ($cell.Text + "`t")
            } else {
                $line += "`t"
            }
        }
        Write-Output $line
    }

    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Error $_.Exception.Message
}
