# How to Run?
# 1. Open PowerShell
# 3. Run the script: .\backup.ps1
# 4. The script will create a backup of the database
# 5. The backup will be saved in the same directory as the script

# קובץ גיבוי אוטומטי
$date = Get-Date -Format "yyyy-MM-dd"
$filename = "shibutzplus_backup_$date.sql"

# טעינת DATABASE_URL מתוך .env.local במידה ולא הוגדר בסביבה
if (-not $env:DATABASE_URL) {
    $envFile = Join-Path $PSScriptRoot ".env.local"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^\s*DATABASE_URL\s*=\s*(.+)\s*$") {
                $env:DATABASE_URL = $matches[1].Trim('"').Trim("'")
            }
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "Error: DATABASE_URL not found in environment or .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Starting backup..." -ForegroundColor Green

# הרצת הגיבוי
$connString = if ($env:DATABASE_URL -match "channel_binding=") { $env:DATABASE_URL } else { "$($env:DATABASE_URL)&channel_binding=require" }
pg_dump $connString -f $filename

Write-Host "Backup created successfully: $filename" -ForegroundColor Green
