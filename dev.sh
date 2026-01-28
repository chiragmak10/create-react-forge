#!/bin/bash

# React-Setup Development Guide
# Quick reference for common tasks

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  React-Setup Development Environment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ $# -eq 0 ]; then
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  ${GREEN}install${NC}      - Install dependencies"
    echo "  ${GREEN}dev${NC}          - Run CLI in dev mode"
    echo "  ${GREEN}build${NC}        - Compile TypeScript"
    echo "  ${GREEN}test${NC}         - Run test suite"
    echo "  ${GREEN}test:watch${NC}   - Run tests in watch mode"
    echo "  ${GREEN}test:ui${NC}      - Open Vitest UI"
    echo "  ${GREEN}lint${NC}        - Run ESLint"
    echo "  ${GREEN}format${NC}      - Format code with Prettier"
    echo "  ${GREEN}clean${NC}       - Remove build artifacts"
    echo ""
    exit 0
fi

case "$1" in
    install)
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}\n"
        ;;
    dev)
        echo -e "${YELLOW}🚀 Starting CLI in dev mode...${NC}\n"
        npm run dev
        ;;
    build)
        echo -e "${YELLOW}🔨 Building project...${NC}"
        npm run build
        echo -e "${GREEN}✓ Build complete${NC}\n"
        ;;
    test)
        echo -e "${YELLOW}🧪 Running tests...${NC}\n"
        npm run test
        ;;
    test:watch)
        echo -e "${YELLOW}👀 Running tests in watch mode...${NC}\n"
        npm run test:watch
        ;;
    test:ui)
        echo -e "${YELLOW}🎨 Opening Vitest UI...${NC}\n"
        npm run test:ui
        ;;
    lint)
        echo -e "${YELLOW}🔍 Running ESLint...${NC}\n"
        npm run lint
        ;;
    format)
        echo -e "${YELLOW}✨ Formatting code...${NC}"
        npm run format
        echo -e "${GREEN}✓ Code formatted${NC}\n"
        ;;
    clean)
        echo -e "${YELLOW}🧹 Cleaning up...${NC}"
        npm run clean
        echo -e "${GREEN}✓ Cleanup complete${NC}\n"
        ;;
    *)
        echo -e "${YELLOW}Unknown command: $1${NC}"
        exit 1
        ;;
esac
