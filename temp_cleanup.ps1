$path = 'c:\Users\kenny\OneDrive\Documents\Why Racing\GitHub\why-racing-site\pages\admin\races.html'
$lines = Get-Content $path
$filtered = for ($i = 0; $i -lt $lines.Count; $i++) {
    $ln = $i + 1
    if (($ln -ge 1770 -and $ln -le 1804) -or 
        ($ln -ge 1806 -and $ln -le 1828) -or 
        ($ln -ge 1830 -and $ln -le 1852) -or
        ($ln -ge 1888 -and $ln -le 1990)) {
        continue
    }
    $lines[$i]
}
$filtered | Set-Content $path
