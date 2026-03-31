[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dir = Join-Path $PSScriptRoot ".."
$files = Get-ChildItem -Path $dir -Recurse -Filter "*.xlsx"

foreach ($f in $files) {
    if ($f.Name -match "切紙機") {
        $file = $f.FullName
        break
    }
}

if (-not $file) {
    $file = $files[0].FullName
}

Write-Output "Reading: $file"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.DisplayAlerts = $false
    $wb = $excel.Workbooks.Open($file)
    $ws = $wb.Worksheets.Item(1)

    $rows = $ws.UsedRange.Rows.Count
    $cols = $ws.UsedRange.Columns.Count

    $maxRow = [math]::min($rows, 50)
    $maxCol = [math]::min($cols, 15)

    for ($i = 1; $i -le $maxRow; $i++) {
        $line = ""
        for ($j = 1; $j -le $maxCol; $j++) {
            $val = $ws.Cells.Item($i, $j).Text
            if ($val -ne $null) {
                # replace newlines in cells to avoid broken rows
                $val = $val -replace "`n", " " -replace "`r", ""
                $line += ($val + "|")
            } else {
                $line += "|"
            }
        }
        Write-Output $line
    }

    $wb.Close($false)
    $excel.Quit()
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
