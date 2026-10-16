@description('The name of the Azure Static Web App resource.')
param staticWebAppName string = 'ps09-adaptive-memory-${uniqueString(resourceGroup().id)}'

@description('The geographic location of the Static Web App resource.')
param location string = 'eastus2'

@description('SKU tier for Azure Static Web App (Free or Standard).')
@allowed([
  'Free'
  'Standard'
])
param skuTier string = 'Free'

@description('Repository URL for the project.')
param repositoryUrl string = 'https://github.com/example/adaptive-memory-game'

@description('Target repository branch.')
param branch string = 'main'

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: skuTier
    tier: skuTier
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: '/'
      apiLocation: ''
      appArtifactLocation: 'dist'
    }
  }
  tags: {
    project: 'PS09-Adaptive-Memory-Matching-Game'
    environment: 'production'
    managedBy: 'bicep'
  }
}

output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id
output staticWebAppName string = staticWebApp.name
