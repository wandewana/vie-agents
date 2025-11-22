param(
    [Parameter(Mandatory=$true)]
    [string]$WorkspacePath,
    
    [Parameter(Mandatory=$true)]
    [string]$BranchName,
    
    [Parameter(Mandatory=$true)]
    [string]$Prompt
)

# Error handling
$ErrorActionPreference = "Stop"

try {
    Write-Host "=== Agent Task Execution Started ==="
    Write-Host "Workspace: $WorkspacePath"
    Write-Host "Branch: $BranchName"
    Write-Host "Prompt: $Prompt"
    Write-Host ""

    # Navigate to workspace
    if (-not (Test-Path $WorkspacePath)) {
        throw "Workspace path does not exist: $WorkspacePath"
    }
    
    Set-Location $WorkspacePath
    Write-Host "Changed directory to: $WorkspacePath"

    # Detect the default branch (main or master)
    Write-Host "Detecting default branch..."
    $defaultBranch = git symbolic-ref refs/remotes/origin/HEAD 2>$null | ForEach-Object { $_ -replace 'refs/remotes/origin/', '' }

    if ([string]::IsNullOrWhiteSpace($defaultBranch)) {
        # Fallback: try to detect from current branch or common names
        $currentBranch = git branch --show-current 2>$null
        if ($currentBranch -eq "main" -or $currentBranch -eq "master") {
            $defaultBranch = $currentBranch
        } else {
            # Check if main or master exists
            $branches = git branch -a 2>$null
            if ($branches -match "main") {
                $defaultBranch = "main"
            } elseif ($branches -match "master") {
                $defaultBranch = "master"
            } else {
                throw "Could not detect default branch (main or master)"
            }
        }
    }

    Write-Host "Default branch detected: $defaultBranch"

    # Ensure we're on default branch and up to date
    Write-Host "Checking out $defaultBranch branch..."
    $ErrorActionPreference = "Continue"

    # Force checkout to default branch (in case we're on a feature branch)
    git checkout -f $defaultBranch 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to checkout $defaultBranch branch"
    }

    Write-Host "Pulling latest changes..."
    git pull origin $defaultBranch 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to pull latest changes"
    }

    # Clean up old feature branches (optional - keeps workspace tidy)
    Write-Host "Cleaning up old feature branches..."
    git branch | Select-String "feature/task-" | ForEach-Object {
        $branch = $_.ToString().Trim()
        git branch -D $branch 2>&1 | Out-Null
    }

    # Create new branch
    Write-Host "Creating new branch: $BranchName"
    git checkout -b $BranchName 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create branch $BranchName"
    }
    $ErrorActionPreference = "Stop"

    # Run Claude Code CLI
    Write-Host ""
    Write-Host "=== Running Claude Code CLI ==="
    Write-Host "Prompt: $Prompt"
    Write-Host ""

    # Execute claude command with proper quoting and automation flags
    # --dangerously-skip-permissions: Skip all permission prompts for automation
    # --verbose: Show detailed progress
    Write-Host "Starting Claude CLI (this may take a few minutes for complex tasks)..."
    claude -p "$Prompt" --dangerously-skip-permissions --verbose 2>&1 | Write-Host

    if ($LASTEXITCODE -ne 0) {
        throw "Claude CLI failed with exit code: $LASTEXITCODE"
    }

    Write-Host ""
    Write-Host "Claude CLI completed successfully!"

    Write-Host ""
    Write-Host "=== Claude execution completed ==="
    Write-Host ""

    # Check if there are changes
    $ErrorActionPreference = "Continue"
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "No changes made by Claude. Exiting."
        # Clean up branch
        git checkout $defaultBranch 2>&1 | Out-String | Write-Host
        git branch -D $BranchName 2>&1 | Out-String | Write-Host
        exit 0
    }

    Write-Host "Changes detected. Committing..."

    # Commit changes
    git add . 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to stage changes"
    }

    # Escape quotes in commit message for git
    $commitMessage = "Task: $($Prompt -replace '"', '\"')"
    git commit -m "$commitMessage" 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit changes"
    }

    # Push branch
    Write-Host "Pushing branch to remote..."
    git push origin $BranchName 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push branch"
    }
    $ErrorActionPreference = "Stop"

    # Create PR using GitHub CLI
    Write-Host "Creating pull request..."

    # Use full path to gh.exe in case it's not in PATH
    $ghPath = "C:\Program Files\GitHub CLI\gh.exe"
    if (-not (Test-Path $ghPath)) {
        # Fallback to PATH if not in default location
        $ghPath = "gh"
    }

    # Escape quotes in prompt for PR title/body
    $escapedPrompt = $Prompt -replace '"', '\"'
    $prTitle = "Task: $escapedPrompt"
    $prBody = "Automated task executed by agent`n`nPrompt: $escapedPrompt"

    # Use argument array to properly handle spaces and special characters
    $ghArgs = @(
        "pr", "create",
        "--title", $prTitle,
        "--body", $prBody,
        "--base", $defaultBranch,
        "--head", $BranchName
    )

    $prOutput = & $ghPath @ghArgs 2>&1
    
    Write-Host $prOutput
    
    # Extract PR URL from output
    $prUrl = $prOutput | Select-String -Pattern "https://github.com/[^\s]+" | ForEach-Object { $_.Matches.Value }
    
    if ($prUrl) {
        Write-Host ""
        Write-Host "PR_URL:$prUrl"
        Write-Host ""
    } else {
        Write-Host "Warning: Could not extract PR URL from gh output"
    }

    Write-Host "=== Task Execution Completed Successfully ==="
    exit 0

} catch {
    Write-Error "Task execution failed: $_"
    Write-Error $_.ScriptStackTrace
    exit 1
}