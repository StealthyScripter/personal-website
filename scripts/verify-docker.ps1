param([string]$ProjectName = ('bw-verify-' + [Guid]::NewGuid().ToString('N').Substring(0, 12)))
$ErrorActionPreference = 'Stop'
if ($ProjectName -notmatch '^bw-verify-[a-z0-9-]+$') { throw 'Use an isolated bw-verify-* project name.' }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is unavailable. Install/start Docker Desktop with Linux containers, then rerun this script.' }
function Invoke-Compose {
    & docker compose --file compose.yaml --project-name $ProjectName @args
    if ($LASTEXITCODE -ne 0) { throw ('Compose failed: ' + ($args -join ' ')) }
}
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    $engineType = & docker info --format '{{.OSType}}'
    if ($LASTEXITCODE -ne 0) { throw 'Docker Engine is not available.' }
    if ($engineType -ne 'linux') { throw 'Switch Docker Desktop to Linux containers.' }
    $existingVolumes = @(& docker volume ls --filter "label=com.docker.compose.project=$ProjectName" --quiet)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect Docker volumes.' }
    $existingContainers = @(Invoke-Compose ps --all --quiet)
    if ($existingVolumes.Count -or $existingContainers.Count) { throw 'Verification requires a fresh project name with no existing containers or volumes.' }
    foreach ($port in @(3000, 5173, 4000, 9000, 9001)) {
        $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $port)
        try { $listener.Start() } catch { throw "Port $port is occupied. Stop the corresponding local development server before running verification." } finally { $listener.Stop() }
    }
    Invoke-Compose config --quiet
    Invoke-Compose up --build --detach --wait --wait-timeout 300
    Invoke-Compose ps --all
    foreach ($service in @('backend', 'v4', 'admin')) {
        Invoke-Compose exec -T $service node -e "if(process.versions.node.split('.')[0]!=='20')process.exit(1);console.log(process.version)"
    }
    foreach ($url in @('http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000/health')) {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 60
        if ($response.StatusCode -ne 200) { throw "Unexpected HTTP response from $url" }
        Write-Output "PASS host access: $url"
    }
    Invoke-Compose exec -T -e DOCKER_VERIFICATION=1 backend node --import tsx docker/verify.mjs prepare
    Invoke-Compose down
    Invoke-Compose up --detach --wait --wait-timeout 300
    Invoke-Compose exec -T -e DOCKER_VERIFICATION=1 backend node --import tsx docker/verify.mjs check
    Invoke-Compose down
    Write-Output "PASS: build/startup, health gates, migration/seed, CLI/admin API authentication, frontend access, SSR, message/inbox and restart persistence."
    Write-Output "Stopped isolated project $ProjectName; its named volumes remain."
    Write-Output "Optional DESTRUCTIVE removal of only this test project's volumes: docker compose --file compose.yaml --project-name $ProjectName down -v"
} finally { Pop-Location }
