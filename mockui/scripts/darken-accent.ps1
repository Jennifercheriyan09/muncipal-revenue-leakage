$root = "d:\muncipal-revenue-leakage\mockui"
$exts = @("*.tsx", "*.css")

$replacements = @(
  @{ from = '#e91e8c'; to = '#be185d' },
  @{ from = '#c2185b'; to = '#9d174d' },
  @{ from = '#fce7f3'; to = '#fdf2f8' }
)

foreach ($ext in $exts) {
  $files = Get-ChildItem -Path "$root\app","$root\components" -Recurse -Include $ext -ErrorAction SilentlyContinue
  foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $changed = $false
    foreach ($r in $replacements) {
      if ($content.Contains($r.from)) {
        $content = $content.Replace($r.from, $r.to)
        $changed = $true
      }
    }
    if ($changed) {
      [System.IO.File]::WriteAllText($f.FullName, $content)
      Write-Host "Updated: $($f.Name)"
    }
  }
}
Write-Host "Done."
