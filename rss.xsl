<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rss="http://purl.org/rss/1.0/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/" version="1.0">
  <xsl:template match="/">
  <html>
    <head>
      <link rel="STYLESHEET" href="data/style.css" type="text/css"></link>
    </head>
    <body>
      <h1>Karuki Next RSS (alpha version)</h1>
      <xsl:apply-templates />
    </body>
  </html>
  </xsl:template>
  
  <xsl:template match="item">
    <h2>
      <a>
	<xsl:attribute name="href"><xsl:value-of select="guid/text()"/></xsl:attribute>
	<xsl:value-of select="title/text()" />
      </a>
    </h2>
    <div class="wiki-body">
      <xsl:value-of select="content:encoded" disable-output-escaping="yes" />
    </div>
  </xsl:template>
</xsl:stylesheet>
