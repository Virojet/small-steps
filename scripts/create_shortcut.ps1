$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Small Steps.lnk'

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'C:\Users\ltgre\OneDrive\Desktop\Workspace\Habit tracker\dist\Small Steps\Small Steps.exe'
$shortcut.WorkingDirectory = 'C:\Users\ltgre\OneDrive\Desktop\Workspace\Habit tracker\dist\Small Steps'
$shortcut.Description = 'Small Steps Habit Tracker'
$shortcut.Save()

Write-Host "Created shortcut at: $shortcutPath"
Write-Host "Exists: $(Test-Path $shortcutPath)"
