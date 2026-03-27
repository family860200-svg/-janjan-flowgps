param($FilePath)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.DisplayAlerts = $false
    $wb = $excel.Workbooks.Open($FilePath)

    for ($s = 1; $s -le $wb.Worksheets.Count; $s++) {
        $ws = $wb.Worksheets.Item($s)
        [Console]::WriteLine("=== SHEET: $($ws.Name) ===")

        $rows = $ws.UsedRange.Rows.Count
        $cols = $ws.UsedRange.Columns.Count
        $maxRow = [math]::min($rows, 100)
        $maxCol = [math]::min($cols, 20)

        for ($i = 1; $i -le $maxRow; $i++) {
            $line = ""
            for ($j = 1; $j -le $maxCol; $j++) {
                $val = $ws.Cells.Item($i, $j).Text
                if ($val -ne $null) {
                    $val = $val -replace "`n", " " -replace "`r", ""
                }
                $line += ($val + "`t")
            }
            [Console]::WriteLine($line)
        }
    }

    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    [Console]::WriteLine("Error: $($_.Exception.Message)")
}
