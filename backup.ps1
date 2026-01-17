# How to Run?
# 1. Open PowerShell
# 3. Run the script: .\backup.ps1
# 4. The script will create a backup of the database
# 5. The backup will be saved in the same directory as the script

# קובץ גיבוי אוטומטי
$date = Get-Date -Format "yyyy-MM-dd"
$filename = "shibutzplus_backup_$date.sql"

Write-Host "Starting backup..." -ForegroundColor Green

# הרצת הגיבוי
pg_dump "postgresql://shibutzplus_owner:npg_nLsFwZc4z6EI@ep-frosty-base-a2h07xmx.eu-central-1.aws.neon.tech/shibutzplus?sslmode=require&channel_binding=require" -f $filename

Write-Host "Backup created successfully: $filename" -ForegroundColor Green