@echo off
REM Docker Compose Setup Script for E-Commerce Platform (Windows PowerShell)
REM Usage: docker-setup.ps1 [command]

param(
    [string]$Command = "help",
    [string]$Service = ""
)

# Colors
$InfoColor = "Blue"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Print-Info($message) {
    Write-Host "[INFO] " -ForegroundColor $InfoColor -NoNewline
    Write-Host $message
}

function Print-Success($message) {
    Write-Host "[SUCCESS] " -ForegroundColor $SuccessColor -NoNewline
    Write-Host $message
}

function Print-Error($message) {
    Write-Host "[ERROR] " -ForegroundColor $ErrorColor -NoNewline
    Write-Host $message
}

function Print-Warning($message) {
    Write-Host "[WARNING] " -ForegroundColor $WarningColor -NoNewline
    Write-Host $message
}

# Check Docker
function Check-Docker {
    Print-Info "Checking Docker installation..."
    
    try {
        $null = docker --version
        if ($LASTEXITCODE -ne 0) {
            Print-Error "Docker is not installed"
            exit 1
        }
    } catch {
        Print-Error "Docker is not installed"
        exit 1
    }
    
    try {
        $null = docker info
        if ($LASTEXITCODE -ne 0) {
            Print-Error "Docker daemon is not running. Please start Docker Desktop."
            exit 1
        }
    } catch {
        Print-Error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    }
    
    Print-Success "Docker is installed and running"
}

# Start services
function Start-Services {
    Print-Info "Starting all services..."
    docker-compose up -d
    Print-Success "Services started"
    
    Print-Info "Waiting for services to be healthy (30 seconds)..."
    Start-Sleep -Seconds 30
    
    Print-Info "Service status:"
    docker-compose ps
}

# Stop services
function Stop-Services {
    Print-Info "Stopping all services..."
    docker-compose down
    Print-Success "Services stopped"
}

# View logs
function View-Logs($serviceName) {
    if ([string]::IsNullOrEmpty($serviceName)) {
        Print-Info "Showing logs for all services..."
        docker-compose logs -f
    } else {
        Print-Info "Showing logs for $serviceName..."
        docker-compose logs -f $serviceName
    }
}

# Rebuild services
function Rebuild-Services {
    Print-Info "Rebuilding services..."
    docker-compose up -d --build
    Print-Success "Services rebuilt and started"
}

# Health check
function Check-Health {
    Print-Info "Checking service health..."
    
    $services = @(
        @{name="user-service"; port=3001},
        @{name="product-service"; port=3002},
        @{name="order-service"; port=3003},
        @{name="payment-service"; port=3004},
        @{name="frontend"; port=5173}
    )
    
    foreach ($service in $services) {
        $name = $service.name
        $port = $service.port
        
        try {
            if ($name -eq "frontend") {
                $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction Stop
            } else {
                $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 2 -ErrorAction Stop
            }
            Print-Success "$name is healthy (port $port)"
        } catch {
            Print-Error "$name is not responding (port $port)"
        }
    }
}

# Clean all
function Clean-All {
    Print-Warning "This will remove all containers and volumes (data will be lost)."
    $response = Read-Host "Are you sure? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Print-Info "Cleaning up..."
        docker-compose down -v
        Print-Success "All containers and volumes removed"
    } else {
        Print-Info "Cleanup cancelled"
    }
}

# Show usage
function Show-Usage {
    $usage = @"
E-Commerce Platform - Docker Setup

Usage: .\docker-setup.ps1 [command]

Commands:
  start       Start all services
  stop        Stop all services
  rebuild     Rebuild and start services
  logs        View logs (optionally: logs -Service <name>)
  health      Check service health
  clean       Remove all containers and volumes
  status      Show container status
  help        Show this help message

Examples:
  .\docker-setup.ps1 start
  .\docker-setup.ps1 logs -Service user-service
  .\docker-setup.ps1 health

Services:
  - User Service: http://localhost:3001
  - Product Service: http://localhost:3002
  - Order Service: http://localhost:3003
  - Payment Service: http://localhost:3004
  - Frontend: http://localhost:5173
"@
    Write-Host $usage
}

# Main logic
switch ($Command.ToLower()) {
    "start" {
        Check-Docker
        Start-Services
        Print-Info "Services are starting. Access them at:"
        Write-Host "  Frontend: http://localhost:5173"
        Write-Host "  APIs: http://localhost:3001-3004"
    }
    "stop" {
        Stop-Services
    }
    "rebuild" {
        Check-Docker
        Rebuild-Services
    }
    "logs" {
        View-Logs $Service
    }
    "health" {
        Check-Health
    }
    "clean" {
        Clean-All
    }
    "status" {
        docker-compose ps
    }
    "help" {
        Show-Usage
    }
    default {
        Print-Error "Unknown command: $Command"
        Show-Usage
        exit 1
    }
}
