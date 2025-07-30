const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // adjust path as needed

router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await Post.find({}, 'slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `<url><loc>https://yourdomain.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    posts.forEach(post => {
      xml += `
<url>
  <loc>https://yourdomain.com/post/${post.slug}</loc>
  <lastmod>${post.updatedAt.toISOString()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
