$files = @(
    "src/app/api/events/[id]/divisions/[divisionId]/route.ts",
    "src/app/api/events/[id]/divisions/route.ts",
    "src/app/api/events/[id]/participants/route.ts",
    "src/app/api/events/[id]/passes/generate/route.ts",
    "src/app/api/events/[id]/sessions/route.ts",
    "src/app/api/users/change-password/route.ts"
)

foreach ($file in $files) {
    $path = "D:\coder\powerspolnep\$file"
    if (Test-Path $path) {
        Write-Host "Fixing $file"
        $content = Get-Content $path -Raw
        $content = $content -replace "verifyToken\(token\)", "verifyTokenSync(token)"
        $content = $content -replace "import \{([^}]*), verifyToken([^}]*)\}", "import {`$1, verifyTokenSync`$2}"
        Set-Content $path $content
    }
}