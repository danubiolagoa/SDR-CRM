# Neon MCP Server Setup
# O Neon MCP ja esta configurado via connection string
# Para usar o Neon como MCP server, configure em .mcp.json:

$repoRoot = Split-Path -Parent $PSScriptRoot
$mcpConfigPath = Join-Path $repoRoot '.mcp.json'

# Verificar se ja tem a config do Neon
if (Test-Path $mcpConfigPath) {
  $config = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
  if ($config.mcpServers.neon) {
    Write-Host "Neon MCP ja configurado"
    exit 0
  }
}

Write-Host "Neon usa connection string direta"
Write-Host "Connection string configurada em .env.local"
Write-Host "VITE_NEON_DATABASE_URL"
