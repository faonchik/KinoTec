param()
$ErrorActionPreference = "Continue"
chcp 65001 | Out-Null

$TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOTEyODZiOGU0YWIyMmMzYzdlNWJmNDYyOTEyNzk0MCIsIm5iZiI6MTc2NDU3MzMzMC42MjMwMDAxLCJzdWIiOiI2OTJkNDA5Mjk5ZWI4Mzg5NzAzZWExNzgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.9Hiep2_UYTDWqZTLVf0YSsVt8inkPWGZXpd4xrgtHqE"
$TMDB_BASE = "https://api.themoviedb.org/3"
$TMDB_IMG = "https://image.tmdb.org/t/p"
$headers = @{ "Authorization" = "Bearer $TMDB_TOKEN"; "Accept" = "application/json" }

Write-Host "Fetching movies from DB..."

$getMoviesJs = @"
const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
p.movie.findMany({select:{id:true,title:true,originalTitle:true,poster:true,backdrop:true,tmdbId:true,releaseDate:true},orderBy:{popularity:'desc'}}).then(m=>{console.log(JSON.stringify(m));p.`$disconnect()}).catch(e=>{console.error(e);p.`$disconnect()});
"@

$tempFile = Join-Path $PSScriptRoot "temp-gm.js"
$getMoviesJs | Out-File -FilePath $tempFile -Encoding ASCII
$jsonStr = node $tempFile 2>$null
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

if (-not $jsonStr) {
    Write-Host "ERROR: Could not get movies from DB"
    exit 1
}

$movies = $jsonStr | ConvertFrom-Json
Write-Host "Found $($movies.Count) movies"

$updated = 0

foreach ($m in $movies) {
    $q = if ($m.originalTitle) { $m.originalTitle } else { $m.title }
    $enc = [System.Uri]::EscapeDataString($q)
    
    $tmdb = $null
    try {
        $sr = Invoke-RestMethod -Uri "$TMDB_BASE/search/movie?query=$enc&language=ru-RU" -Headers $headers
        if ($sr.results.Count -gt 0) { $tmdb = $sr.results[0] }
    }
    catch {
        Write-Host "  ERR search: $($m.title) - $($_.Exception.Message)"
        continue
    }
    
    if (-not $tmdb -and $m.title -ne $q) {
        $enc2 = [System.Uri]::EscapeDataString($m.title)
        try {
            $sr2 = Invoke-RestMethod -Uri "$TMDB_BASE/search/movie?query=$enc2&language=ru-RU" -Headers $headers
            if ($sr2.results.Count -gt 0) { $tmdb = $sr2.results[0] }
        }
        catch {}
    }
    
    if (-not $tmdb) {
        Write-Host "  SKIP: $($m.title)"
        continue
    }
    
    $poster = ""
    $backdrop = ""
    if ($tmdb.poster_path) { $poster = "$TMDB_IMG/w500$($tmdb.poster_path)" }
    if ($tmdb.backdrop_path) { $backdrop = "$TMDB_IMG/original$($tmdb.backdrop_path)" }
    $tid = $tmdb.id.ToString()
    
    if ($poster -or $backdrop) {
        $parts = @()
        if ($poster) { $parts += "poster:'$poster'" }
        if ($backdrop) { $parts += "backdrop:'$backdrop'" }
        $parts += "tmdbId:'$tid'"
        $dataStr = $parts -join ","
        
        $upJs = "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.movie.update({where:{id:'$($m.id)'},data:{$dataStr}}).then(()=>{console.log('OK');p.`$disconnect()}).catch(e=>{console.error(e.message);p.`$disconnect()});"
        
        $tempUp = Join-Path $PSScriptRoot "temp-up.js"
        $upJs | Out-File -FilePath $tempUp -Encoding ASCII
        $res = node $tempUp 2>&1
        Remove-Item $tempUp -Force -ErrorAction SilentlyContinue
        
        if ("$res" -match "OK") {
            Write-Host "  OK: $($m.title)"
            $updated++
        }
        else {
            Write-Host "  FAIL: $($m.title) - $res"
        }
    }
    
    Start-Sleep -Milliseconds 350
}

Write-Host ""
Write-Host "Done! Updated: $updated / $($movies.Count)"
