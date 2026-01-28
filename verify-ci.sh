#!/bin/bash
set -e

echo "=== Running CI Verification ==="
echo ""

echo "Step 1: Running lint..."
npm run lint
echo "✓ Lint passed"
echo ""

echo "Step 2: Running build..."
npm run build
echo "✓ Build passed"
echo ""

echo "Step 3: Running tests..."
npm run test
echo "✓ Tests passed"
echo ""

echo "=== All CI checks passed! ==="
