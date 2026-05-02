$project = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$launcher = Join-Path $project "scripts\start-schedule-widget.vbs"
$wscript = Join-Path $env:WINDIR "System32\wscript.exe"
$desktop = [Environment]::GetFolderPath("DesktopDirectory")
$startup = [Environment]::GetFolderPath("Startup")
$icon = (Join-Path $env:WINDIR "System32\shell32.dll") + ",44"
$shortcutName = ([char]0x5929).ToString() + ([char]0x67a2).ToString() + ([char]0x7684).ToString() + ([char]0x4e8b).ToString() + ([char]0x4e1a).ToString() + ".lnk"

$shell = New-Object -ComObject WScript.Shell

$shortcuts = @(
  @{
    Path = Join-Path $desktop $shortcutName
    Description = "Start Schedule Widget"
  },
  @{
    Path = Join-Path $startup $shortcutName
    Description = "Start Schedule Widget at login"
  }
)

foreach ($item in $shortcuts) {
  $shortcut = $shell.CreateShortcut($item.Path)
  $shortcut.TargetPath = $wscript
  $shortcut.Arguments = '"' + $launcher + '"'
  $shortcut.WorkingDirectory = $project
  $shortcut.Description = $item.Description
  $shortcut.IconLocation = $icon
  $shortcut.Save()

  Write-Output $item.Path
}
