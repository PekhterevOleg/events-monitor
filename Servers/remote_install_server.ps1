function Install-EventWatcherToServer {
    [CmdletBinding()]
    param (
        [string]$localPath = "E:\Git\events-monitor\Servers",
        [string]$remotePath = "C:\Windows\System32\drivers\etc\ProjectEventWatcherForSrv",
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$server,
        [System.Management.Automation.PSCredential]$Credential

    )

    $installFile = "install.ps1"
    $installPath = $remotePath + '\' + $installFile
    try {
        $session = New-PSSession -ComputerName $server -Credential $Credential -ErrorAction Stop

        Copy-Item -Path $localPath -Filter *.* -Destination $remotePath -ToSession $session -Recurse -ErrorAction Stop
        Invoke-Command -Session $session -ScriptBlock { Set-Location -Path $using:remotePath; & $using:installPath | Out-Null } -ErrorAction Stop
        Remove-PSSession -Session $session -ErrorAction Stop
        Write-Host "Процесс на $server инсталлирован"
    } catch {
        Write-Error "Произошла ошибка: $_"
        Write-Error "Сообщение об ошибке: $($_.Exception.Message)"
        Write-Error "Идентификатор ошибки: $($_.FullyQualifiedErrorId)"
        Write-Error "Трассировка стека: $($_.ScriptStackTrace)"
        Write-Error "Категория ошибки: $($_.CategoryInfo.Category)"
    }
}