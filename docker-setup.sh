#!/bin/bash

# Docker Compose Setup Script for E-Commerce Platform
# Usage: bash docker-setup.sh [command]

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

# Colors for Windows PowerShell compatibility
print_info() {
    echo -e "${BLUE}[INFO]${RESET} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${RESET} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${RESET} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${RESET} $1"
}

# Check if Docker is running
check_docker() {
    print_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Start services
start_services() {
    print_info "Starting all services..."
    docker-compose up -d
    print_success "Services started"
    
    print_info "Waiting for services to be healthy (30 seconds)..."
    sleep 30
    
    print_info "Service status:"
    docker-compose ps
}

# Stop services
stop_services() {
    print_info "Stopping all services..."
    docker-compose down
    print_success "Services stopped"
}

# View logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_info "Showing logs for all services..."
        docker-compose logs -f
    else
        print_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Rebuild services
rebuild_services() {
    print_info "Rebuilding services..."
    docker-compose up -d --build
    print_success "Services rebuilt and started"
}

# Health check
health_check() {
    print_info "Checking service health..."
    
    services=("user-service:3001" "product-service:3002" "order-service:3003" "payment-service:3004" "frontend:5173")
    
    for service in "${services[@]}"; do
        name=${service%:*}
        port=${service#*:}
        
        if [ "$name" = "frontend" ]; then
            if curl -s "http://localhost:$port" > /dev/null; then
                print_success "$name is healthy (port $port)"
            else
                print_error "$name is not responding (port $port)"
            fi
        else
            if curl -s "http://localhost:$port/health" > /dev/null; then
                print_success "$name is healthy (port $port)"
            else
                print_error "$name is not responding (port $port)"
            fi
        fi
    done
}

# Clean everything
clean_all() {
    print_warning "This will remove all containers and volumes (data will be lost)."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        print_success "All containers and volumes removed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Display usage information
show_usage() {
    cat << EOF
${BLUE}E-Commerce Platform - Docker Setup${RESET}

Usage: ./docker-setup.sh [command]

Commands:
  start       Start all services
  stop        Stop all services
  rebuild     Rebuild and start services
  logs        View logs (optionally: logs <service>)
  health      Check service health
  clean       Remove all containers and volumes
  status      Show container status
  help        Show this help message

Examples:
  ./docker-setup.sh start
  ./docker-setup.sh logs user-service
  ./docker-setup.sh health

Services:
  - User Service: http://localhost:3001
  - Product Service: http://localhost:3002
  - Order Service: http://localhost:3003
  - Payment Service: http://localhost:3004
  - Frontend: http://localhost:5173
EOF
}

# Main script logic
main() {
    local command=${1:-help}
    
    case "$command" in
        start)
            check_docker
            start_services
            print_info "Services are starting. Access them at:"
            echo "  Frontend: http://localhost:5173"
            echo "  APIs: http://localhost:3001-3004"
            ;;
        stop)
            stop_services
            ;;
        rebuild)
            check_docker
            rebuild_services
            ;;
        logs)
            view_logs "$2"
            ;;
        health)
            health_check
            ;;
        clean)
            clean_all
            ;;
        status)
            docker-compose ps
            ;;
        help)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
