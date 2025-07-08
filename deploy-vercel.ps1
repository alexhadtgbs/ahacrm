# ClínicaCRM Vercel Deployment Helper Script
# This script helps prepare and verify your deployment

Write-Host "🚀 ClínicaCRM Vercel Deployment Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
        npm install -g vercel
    }
} catch {
    Write-Host "❌ Vercel CLI not found. Please install it manually:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Cyan
}

# Check if git repository is ready
Write-Host "`n📋 Checking Git repository..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host "`n💡 Consider committing your changes before deploying:" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'Prepare for deployment'" -ForegroundColor White
} else {
    Write-Host "✅ Git repository is clean" -ForegroundColor Green
}

# Check if remote repository is set
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ Remote repository is set: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "❌ No remote repository found. Please add one:" -ForegroundColor Red
    Write-Host "   git remote add origin https://github.com/yourusername/clinicacrm.git" -ForegroundColor Cyan
}

# Check environment variables
Write-Host "`n📋 Checking environment variables..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content $envFile
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "^$var=") {
            Write-Host "✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "❌ $var is missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    Write-Host "💡 Create one based on env.example" -ForegroundColor Cyan
}

# Test build locally
Write-Host "`n📋 Testing build locally..." -ForegroundColor Yellow
try {
    Write-Host "Running: npm run build" -ForegroundColor Gray
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed. Please fix the issues before deploying." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Deployment instructions
Write-Host "`n🚀 Ready to deploy!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

Write-Host "`n📋 Choose your deployment method:" -ForegroundColor Yellow

Write-Host "`n1️⃣ Vercel Dashboard (Recommended):" -ForegroundColor Cyan
Write-Host "   • Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   • Click 'New Project'" -ForegroundColor White
Write-Host "   • Import your GitHub repository" -ForegroundColor White
Write-Host "   • Set environment variables:" -ForegroundColor White
Write-Host "     - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "     - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "     - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "     - API_KEY_SECRET" -ForegroundColor Gray
Write-Host "   • Click 'Deploy'" -ForegroundColor White

Write-Host "`n2️⃣ Vercel CLI:" -ForegroundColor Cyan
Write-Host "   • Run: vercel login" -ForegroundColor White
Write-Host "   • Run: vercel" -ForegroundColor White
Write-Host "   • Follow the prompts" -ForegroundColor White

Write-Host "`n📚 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Yellow

Write-Host "`n🔗 Useful links:" -ForegroundColor Cyan
Write-Host "   • Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   • Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   • Deployment Guide: DEPLOYMENT.md" -ForegroundColor White

Write-Host "`n🎉 Good luck with your deployment!" -ForegroundColor Green 