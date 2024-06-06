$global:compName = $env:COMPUTERNAME

$global:LOG_FILE_PATH = [Environment]::GetEnvironmentVariable("LOG_FILE_NAME", [EnvironmentVariableTarget]::Machine)
$path_json = [Environment]::GetEnvironmentVariable("PATH_JSON_CONFIG", [EnvironmentVariableTarget]::Machine)

$global:json = Get-Content -Path $path_json -Encoding utf8 | ConvertFrom-Json
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls

function global:WriteErrorToLogFile {
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord,
        [Parameter(Mandatory=$true)]
        [string]$LogFilePath,
        [string]$Message
    )
    $errorMessage = "Дата: $(Get-Date) `r`nПодробная ошибка: $Message `r`nОшибка: $($ErrorRecord.Exception.Message) `r`nСтек вызова: $($ErrorRecord.ScriptStackTrace) `r`n"
    Add-Content -Path $LogFilePath -Value $errorMessage -Encoding UTF8
}

function global:sendMessageToMonitor($data) {
    $body = $data | ConvertTo-Json -ErrorAction Stop
    try {
        Invoke-RestMethod -Uri $json.server_mon_uri -Method Post -Body $body -ContentType "application/json"
    } catch [System.Net.WebException] {
        $errorMsg = $_.InvocationInfo.InvocationName + " " + $_.exception.message
        WriteErrorToLogFile -LogFilePath $LOG_FILE_PATH -ErrorRecord $_ -Message $errorMsg
    }        
}

$query = [System.Diagnostics.Eventing.Reader.EventLogQuery]::new($json.logname, [System.Diagnostics.Eventing.Reader.PathType]::LogName, $json.xmlquery)
$watcher = [System.Diagnostics.Eventing.Reader.EventLogWatcher]::new($query)
$watcher.Enabled = $true

function global:sendMessageToTelegramm($uri) {
    Invoke-RestMethod -Uri $uri -Method Post -ErrorAction stop
}

$action = {
    $messageEvent = $eventargs.EventRecord.FormatDescription()
    $localtime = $eventargs.eventrecord.timecreated.tostring()
        
    $message = "Target: $compName`n`n" +
                "Message: $messageEvent`n" +
                "EventTime: $localtime"

    $encodedMessage = [System.Uri]::EscapeDataString($message)
        
    $uri = "https://api.telegram.org/bot$($json.telegram.token)/sendMessage?chat_id=$($json.telegram.chat_id)&text=$encodedMessage"
    try {
        sendMessageToTelegramm($uri)
    } catch {
        $errorMsg = $error[0].InvocationInfo.InvocationName + " " + $error[0].exception.message
        global:WriteErrorToLogFile -LogFilePath $LOG_FILE_PATH -ErrorRecord $_ -Message $errorMsg
    }
}

Register-ObjectEvent -InputObject $watcher -EventName 'EventRecordWritten' -Action $action

$timerCloseApp = New-Object System.Timers.Timer
$timerCloseApp.Interval = $json.close_app_interval

$timerSendData = New-Object System.Timers.Timer
$timerSendData.Interval = $json.send_data_interval

Register-ObjectEvent -InputObject $timerCloseApp -EventName Elapsed -Action {
    $stop_file = [Environment]::GetEnvironmentVariable('STOP_FILE_NAME', [EnvironmentVariableTarget]::Machine)
    if (Test-Path $stop_file) {
        try {
            Remove-Item -Path $stop_file -ErrorAction Stop
        } catch {
            $errorMsg = $error[0].InvocationInfo.InvocationName + " " + $error[0].exception.message
            global:WriteErrorToLogFile -LogFilePath $LOG_FILE_PATH -ErrorRecord $_ -Message $errorMsg
        }
        Get-EventSubscriber | Unregister-Event
        [Environment]::Exit(0)
    }
}

Register-ObjectEvent -InputObject $timerSendData -EventName Elapsed -Action {
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ssZ"
    try {
        sendMessageToMonitor(@{"serverName"=$CompName; "timestamp"=$currentTime})
    } catch {
        $errorMsg = $_.InvocationInfo.InvocationName + " " + $_.exception.message
        WriteErrorToLogFile -LogFilePath $LOG_FILE_PATH -ErrorRecord $_ -Message $errorMsg
    }
}

$timerCloseApp.Start()
$timerSendData.Start()