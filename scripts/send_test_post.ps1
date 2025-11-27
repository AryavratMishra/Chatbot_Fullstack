# send_test_post.ps1
# Health-check then POST test payload to /api/gemini and print response
try {
  $h = Invoke-RestMethod -Uri http://localhost:5000/api/health -TimeoutSec 10 -ErrorAction Stop
} catch {
  Write-Host "Health check failed:" $_.Exception.Message
  exit 2
}
if (-not $h.ok) { Write-Host "Health endpoint returned not ok"; exit 2 }

$msg = "Automated test message $(Get-Date -Format o)"
$body = @"
{
  "contents": [
    { "role": "user", "parts": [ { "text": "${msg}" } ] }
  ]
}
"@

Write-Host "Sending payload:`n$body"
try {
  $resp = Invoke-RestMethod -Uri http://localhost:5000/api/gemini -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 120 -ErrorAction Stop
  Write-Host "Response (JSON):"
  $resp | ConvertTo-Json -Depth 6
} catch {
  Write-Host "Request failed:";
  $_ | Format-List * -Force
  if ($_.Exception.Response -ne $null) {
    try {
      $s = $_.Exception.Response.GetResponseStream();
      $r = (New-Object System.IO.StreamReader($s)).ReadToEnd();
      Write-Host "Response body:";
      Write-Host $r
    } catch {
      Write-Host "Could not read response body"
    }
  }
  exit 3
}
