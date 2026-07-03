/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mystic-birth-chart.vercel.app',
  generateRobotsTxt: false, // We have a manual robots.txt
  generateIndexSitemap: false,
  exclude: ['/thank-you'],
  outDir: './public',
  transform: async (_config, path) => {
    const isBlogPost = path.startsWith('/blog/') && !path.startsWith('/blog/category/');
    const isCategory = path.startsWith('/blog/category/');
    const isLegal = ['/privacy', '/terms'].includes(path);

    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1;
      changefreq = 'daily';
    } else if (path === '/free-birth-chart') {
      priority = 0.95;
      changefreq = 'daily';
    } else if (path === '/birth-chart-report') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/blog') {
      priority = 0.85;
      changefreq = 'daily';
    } else if (isBlogPost) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (isCategory) {
      priority = 0.75;
      changefreq = 'weekly';
    } else if (isLegal) {
      priority = 0.2;
      changefreq = 'yearly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};

module.exports = config;
