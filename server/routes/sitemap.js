const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || 'https://blog.ekolinc.com';
    const posts = await Post.find({}, 'slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `<url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `<url><loc>${siteUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
    xml += `<url><loc>${siteUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>\n`;

    posts.forEach(post => {
      xml += `<url>
  <loc>${siteUrl}/post/${post.slug}</loc>
  <lastmod>${post.updatedAt.toISOString()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
