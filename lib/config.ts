// Branding and Logo Configuration
export const BRAND_CONFIG = {
  // Logo settings
  logo: {
    src: '/images/logo.png',
    alt: 'Company Logo',
    defaultWidth: 200,
    defaultHeight: 60,
    showBackground: true,
    backgroundColor: '#004B93', // Dark blue background for white logos
  },
  
  // Company information
  company: {
    name: 'Clínica Baviera',
    description: 'Lead Management Platform',
  },
  
  // Theme colors
  colors: {
    primary: '#004B93',
    secondary: '#008080',
    background: '#F8F9FA',
    surface: '#FFFFFF',
  }
}

// Helper function to get logo configuration
export function getLogoConfig() {
  return BRAND_CONFIG.logo
}

// Helper function to get company info
export function getCompanyInfo() {
  return BRAND_CONFIG.company
} 