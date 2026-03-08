#!/bin/bash

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Validate required environment variables
validate_env() {
    local missing=()
    
    [ -z "$AWS_REGION" ] && missing+=("AWS_REGION")
    [ -z "$LAMBDA_FUNCTION_NAME" ] && missing+=("LAMBDA_FUNCTION_NAME")
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
}

# Clean up build artifacts
cleanup() {
    log_info "Cleaning up build artifacts..."
    rm -rf dist lambda-package video-processing-service.zip
}

# Main script
main() {
    print_header "🚀 Lambda Build and Deploy Script"
    
    log_info "Validating environment variables..."
    validate_env
    
    print_header "📋 Deployment Configuration"
    echo "Lambda Function: $LAMBDA_FUNCTION_NAME"
    echo "AWS Region:      $AWS_REGION"
    echo "Working Dir:     $(pwd)"
    
    # Step 1: Clean old builds
    print_header "🧹 Cleaning Old Builds"
    cleanup
    
    # Step 2: Install ALL dependencies (including dev for build)
    print_header "📦 Installing Dependencies"
    log_info "Running npm ci (including devDependencies for build)..."
    
    if npm ci --silent; then
        log_success "Dependencies installed"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
    
    # Step 3: Build TypeScript
    print_header "🏗️  Building TypeScript"
    log_info "Running npm run build..."
    
    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        exit 1
    fi
    
    # Step 4: Reinstall only production dependencies
    print_header "📦 Installing Production Dependencies"
    log_info "Reinstalling without devDependencies..."
    
    if npm ci --omit=dev --silent; then
        log_success "Production dependencies ready"
    else
        log_error "Failed to install production dependencies"
        exit 1
    fi
    
    # Step 5: Create Lambda package
    print_header "📦 Creating Lambda Package"
    log_info "Creating deployment package..."
    
    mkdir -p lambda-package
    
    # Copy built files
    log_info "Copying dist files..."
    cp -r dist/* lambda-package/
    
    # Copy node_modules
    log_info "Copying node_modules..."
    cp -r node_modules lambda-package/
    
    # Copy package.json
    log_info "Copying package.json..."
    cp package.json lambda-package/
    
    log_success "Package structure created"
    
    # Step 6: Create ZIP file
    print_header "🗜️  Creating ZIP Archive"
    log_info "Compressing files..."
    
    cd lambda-package
    if zip -r ../video-processing-service.zip . -q; then
        cd ..
        ZIP_SIZE=$(du -h video-processing-service.zip | cut -f1)
        log_success "ZIP created successfully (Size: $ZIP_SIZE)"
    else
        cd ..
        log_error "Failed to create ZIP file"
        exit 1
    fi
    
    # Step 7: Upload to Lambda
    print_header "☁️  Uploading to AWS Lambda"
    log_info "Updating Lambda function code..."
    
    if aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb://video-processing-service.zip \
        --region "$AWS_REGION" \
        --output json > /dev/null; then
        log_success "Lambda function code updated successfully"
    else
        log_error "Failed to update Lambda function code"
        exit 1
    fi
    
    # Step 8: Wait for update to complete
    print_header "⏳ Waiting for Lambda Update"
    log_info "Waiting for function to be ready..."
    
    if aws lambda wait function-updated \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --region "$AWS_REGION"; then
        log_success "Lambda function is ready"
    else
        log_warning "Wait timed out, but update may still be in progress"
    fi
    
    # Step 9: Get function info
    print_header "📊 Lambda Function Info"
    aws lambda get-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --region "$AWS_REGION" \
        --query '{Name:Configuration.FunctionName,Runtime:Configuration.Runtime,Memory:Configuration.MemorySize,Timeout:Configuration.Timeout,LastModified:Configuration.LastModified,CodeSize:Configuration.CodeSize,State:Configuration.State}' \
        --output table
    
    # Step 10: Cleanup
    print_header "🧹 Cleaning Up"
    cleanup
    log_success "Build artifacts cleaned"
    
    print_header "✅ Deployment Complete"
    log_success "Lambda function '$LAMBDA_FUNCTION_NAME' has been updated successfully!"
    echo ""
    log_info "You can view logs with:"
    echo "  aws logs tail /aws/lambda/$LAMBDA_FUNCTION_NAME --follow"
}

# Trap errors and cleanup
trap 'log_error "Script failed!"; cleanup; exit 1' ERR

# Run main script
main
