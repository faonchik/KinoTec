param()
$ErrorActionPreference = "Continue"
chcp 65001 | Out-Null

$projectRoot = Split-Path $PSScriptRoot -Parent
$postersDir = Join-Path $projectRoot "public\posters"
$backdropsDir = Join-Path $projectRoot "public\backdrops"

if (!(Test-Path $postersDir)) { New-Item -ItemType Directory -Path $postersDir -Force | Out-Null }
if (!(Test-Path $backdropsDir)) { New-Item -ItemType Directory -Path $backdropsDir -Force | Out-Null }

Write-Host "=== Downloading movie covers locally ===" -ForegroundColor Cyan
Write-Host "Posters: $postersDir"
Write-Host "Backdrops: $backdropsDir"
Write-Host ""

# Get movies from DB
$getMoviesJs = @"
const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
p.movie.findMany({select:{id:true,title:true,poster:true,backdrop:true},orderBy:{popularity:'desc'}}).then(m=>{console.log(JSON.stringify(m));p.`$disconnect()}).catch(e=>{console.error(e);p.`$disconnect()});
"@

$tempFile = Join-Path $PSScriptRoot "temp-dl.js"
$getMoviesJs | Out-File -FilePath $tempFile -Encoding ASCII
$jsonStr = node $tempFile 2>$null
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

if (-not $jsonStr) {
    Write-Host "ERROR: Could not get movies from DB" -ForegroundColor Red
    exit 1
}

$movies = $jsonStr | ConvertFrom-Json
Write-Host "Found $($movies.Count) movies" -ForegroundColor Green
Write-Host ""

$downloaded = 0
$skipped = 0
$errors = 0

foreach ($m in $movies) {
    $movieId = $m.id
    $title = $m.title
    
    # Download poster
    if ($m.poster -and $m.poster -match "image\.tmdb\.org") {
        $posterFile = Join-Path $postersDir "$movieId.jpg"
        if (!(Test-Path $posterFile)) {
            try {
                Invoke-WebRequest -Uri $m.poster -OutFile $posterFile -ErrorAction Stop
                Write-Host "  DL poster: $title" -ForegroundColor Green
            }
            catch {
                Write-Host "  ERR poster: $title - $($_.Exception.Message)" -ForegroundColor Red
                $errors++
            }
        }
    }
    
    # Download backdrop
    if ($m.backdrop -and $m.backdrop -match "image\.tmdb\.org") {
        $backdropFile = Join-Path $backdropsDir "$movieId.jpg"
        if (!(Test-Path $backdropFile)) {
            try {
                Invoke-WebRequest -Uri $m.backdrop -OutFile $backdropFile -ErrorAction Stop
                Write-Host "  DL backdrop: $title" -ForegroundColor Green
            }
            catch {
                Write-Host "  ERR backdrop: $title - $($_.Exception.Message)" -ForegroundColor Red
                $errors++
            }
        }
    }
    
    $downloaded++
    
    # Small delay
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=== Download complete ===" -ForegroundColor Cyan
Write-Host "Processed: $downloaded" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor Yellow
Write-Host ""
Write-Host "Updating database to local paths..." -ForegroundColor Cyan

# Update DB to local paths
$updateJs = @"
const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();const fs=require('fs');const path=require('path');
async function main(){
  const movies=await p.movie.findMany({select:{id:true,poster:true,backdrop:true}});
  let updated=0;
  for(const m of movies){
    const data={};
    const posterFile=path.join('public','posters',m.id+'.jpg');
    const backdropFile=path.join('public','backdrops',m.id+'.jpg');
    if(fs.existsSync(posterFile)){data.poster='/posters/'+m.id+'.jpg';}
    if(fs.existsSync(backdropFile)){data.backdrop='/backdrops/'+m.id+'.jpg';}
    if(Object.keys(data).length>0){
      await p.movie.update({where:{id:m.id},data});
      updated++;
    }
  }
  console.log('Updated: '+updated+' movies');
}
main().then(()=>p.`$disconnect()).catch(e=>{console.error(e);p.`$disconnect()});
"@

$tempUpdate = Join-Path $PSScriptRoot "temp-update-paths.js"
$updateJs | Out-File -FilePath $tempUpdate -Encoding ASCII
node $tempUpdate
Remove-Item $tempUpdate -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== ALL DONE ===" -ForegroundColor Green
