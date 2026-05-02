Set shell = CreateObject("WScript.Shell")
projectDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName))
shell.CurrentDirectory = projectDir
shell.Run "cmd /c npm.cmd start", 0, False
