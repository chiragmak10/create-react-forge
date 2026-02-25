#!/usr/bin/env bash

# Cross-Platform Local Testing Script
# This script helps you test create-react-forge locally across different scenarios

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  create-react-forge Local Test Suite  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check Node version
print_header "Checking Node.js version"
NODE_VERSION=$(node -v)
echo "  Node: $NODE_VERSION"
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "  ⚠️  Node 20.9.0+ is required"
    exit 1
fi
print_success "Node version OK"
echo ""

# Install dependencies
print_header "Installing dependencies"
npm ci --silent
print_success "Dependencies installed"
echo ""

# Build project
print_header "Building project"
npm run build --silent
print_success "Build successful"
echo ""

# Run unit tests
print_header "Running unit tests"
npm test -- --run --reporter=verbose 2>&1 | grep -E "^(✓|×|PASS|FAIL)" || npm test -- --run
print_success "Unit tests completed"
echo ""

# Run cross-platform tests
print_header "Running cross-platform tests"
npm test -- --run "src/__tests__/integration/cross-platform-cli.test.ts" 2>&1 | tail -20
print_success "Cross-platform tests completed"
echo ""

# Run E2E CLI tests
print_header "Running E2E CLI tests"
npm test -- --run "src/__tests__/integration/e2e-cli.test.ts" 2>&1 | tail -20
print_success "E2E CLI tests completed"
echo ""

# Test CLI execution
print_header "Testing CLI execution"
node dist/index.js --help > /dev/null && print_success "CLI --help works" || echo "  Note: CLI may require interactive mode"
node dist/index.js --version > /dev/null 2>&1 && print_success "CLI --version works" || echo "  Note: CLI version flag may not be implemented"
echo ""

# Platform info
print_header "Platform information"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  OS: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  OS: macOS"
elif [[ "$OSTYPE" == "msys" ]]; then
    echo "  OS: Windows (Git Bash)"
else
    echo "  OS: $OSTYPE"
fi
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Show coverage report location
print_header "Coverage report"
if [ -f "coverage/index.html" ]; then
    echo "  📊 Coverage report: coverage/index.html"
    print_success "Coverage available"
else
    echo "  Run 'npm run test:coverage' to generate coverage report"
fi
echo ""

# Show next steps
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Testing Complete!           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review test results above"
echo "  2. Check CROSS_PLATFORM_TESTING.md for detailed info"
echo "  3. Run 'npm run test:watch' for continuous testing"
echo "  4. Run 'npm run test:coverage' for coverage details"
echo "  5. Run 'npm run dev' to test CLI interactively"
echo ""
