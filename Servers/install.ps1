$ENV_CONFIG_JSON_NAME = "PATH_JSON_CONFIG"
$NAME_CONFIG = "config_event.json"
$PATH_TO_CONFIG_JSON = "\\" + $env:USERDNSDOMAIN + "\NETLOGON\eventwatcher\" + "$NAME_CONFIG"

if (Test-Path $PATH_TO_CONFIG_JSON) {
    $CONFIG_JSON_VALUE = $PATH_TO_CONFIG_JSON #$env:USERDNSDOMAIN + "\NETLOGON\eventwatcher\" + "$NAME_CONFIG"
} else {
    $CONFIG_JSON_VALUE = (Get-Location).Path + "\" + $NAME_CONFIG
}

[Environment]::SetEnvironmentVariable($ENV_CONFIG_JSON_NAME, $CONFIG_JSON_VALUE, [EnvironmentVariableTarget]::Machine)

$path_to_json = [Environment]::GetEnvironmentVariable($ENV_CONFIG_JSON_NAME, [EnvironmentVariableTarget]::Machine)

$json = Get-Content -Path $path_to_json -Encoding UTF8 | ConvertFrom-Json
$STOP_FILE_NAME = "STOP_FILE_NAME"
$STOP_FILE_VALUE = (Get-Location).Path + "\" + $json.app_stop_file
[Environment]::SetEnvironmentVariable($STOP_FILE_NAME, $STOP_FILE_VALUE, [EnvironmentVariableTarget]::Machine)

$LOG_FILE_NAME = "LOG_FILE_NAME"
$LOG_FILE_VALUE = (Get-Location).Path + "\" + $json.log_file
[Environment]::SetEnvironmentVariable($LOG_FILE_NAME, $LOG_FILE_VALUE, [EnvironmentVariableTarget]::Machine)

$work_dir = (Get-Location).Path

$full_script_path = $work_dir + "\" +  $json.script_name
$taskName = "\eventAccessToPC"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -NoExit -NoProfile -File $($full_script_path)"
$Trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserID "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 00:00:00 -RunOnlyIfNetworkAvailable -StartWhenAvailable
Register-ScheduledTask -TaskName $taskName -Trigger $Trigger -Action $action -Principal $principal -Settings $settings -Description "Задача для мониторинга доступа к ПК"


$scheduler = New-Object -ComObject ("Schedule.Service")
$scheduler.Connect()

$rootFolder = $scheduler.GetFolder("\")

$taskDefinition = $scheduler.NewTask(0)
$taskDefinition.RegistrationInfo.Description = "Задача для отслеживания событий TaskScheduler"
$taskDefinition.Principal.UserId = "SYSTEM"
$taskDefinition.Principal.RunLevel = 1  # 1 - Highest privileges

$trigger = $taskDefinition.Triggers.Create(0)  # 0 - Event trigger
$trigger.Subscription = @"
<QueryList>
  <Query Id='0' Path='Microsoft-Windows-TaskScheduler/Operational'>
    <Select Path='Microsoft-Windows-TaskScheduler/Operational'>
      *[(System[(EventID=111) or (EventID=201) or (EventID=102)]) and EventData[Data[@Name='TaskName']='{0}']]
    </Select>
  </Query>
</QueryList>
"@ -f $taskName

$action = $taskDefinition.Actions.Create(0)  # 0 - Execute
$action.Path = "schtasks"
$action.Arguments = '/run /tn "{0}"' -f $taskName

$rootFolder.RegisterTaskDefinition("watcher_event", $taskDefinition, 6, $null, $null, 4, $null)
Start-ScheduledTask -TaskName $taskName