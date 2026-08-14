param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [ValidateSet(
        'gemini-3.7-flash-high',
        'gemini-3.7-flash-medium',
        'gemini-3.7-flash-low',
        'gemini-3.1-pro-high',
        'gemini-3.1-pro-low'
    )]
    [string]$Model = 'gemini-3.7-flash-medium',

    [ValidateSet('plan', 'accept-edits')]
    [string]$Mode = 'plan'
)

$antigravityCli = 'C:\Users\Ghost\AppData\Local\agy\bin\agy.exe'

if (-not (Test-Path -LiteralPath $antigravityCli)) {
    throw "Antigravity CLI bulunamadi: $antigravityCli"
}

& $antigravityCli `
    --print $Prompt `
    --model $Model `
    --mode $Mode `
    --output-format text

exit $LASTEXITCODE
