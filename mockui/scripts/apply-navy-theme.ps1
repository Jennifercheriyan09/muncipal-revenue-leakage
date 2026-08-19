$root = "d:\muncipal-revenue-leakage\mockui"
$files = Get-ChildItem -Path "$root\app","$root\components" -Recurse -Include *.tsx,*.css

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    $nc = $c `
        -replace '#be185d', '#1d4ed8' `
        -replace '#9d174d', '#1e3a8a' `
        -replace '#fdf2f8', '#eff6ff' `
        -replace '#fce7f3', '#dbeafe' `
        -replace '#e91e8c', '#1d4ed8' `
        -replace '#c2185b', '#1e3a8a' `
        -replace 'rgba\(190,24,93', 'rgba(29,78,216'

    if ($c -ne $nc) {
        [System.IO.File]::WriteAllText($f.FullName, $nc)
        Write-Host "Updated: $($f.Name)"
    }
}
Write-Host "Navy theme applied successfully!"
