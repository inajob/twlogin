<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" doctype-system="http://www.w3.org/TR/html4/strict.dtd" doctype-public="-//W3C//DTD HTML 4.01//EN" indent="yes" />
  <xsl:template match="/">
    <html>
      <head>
	<link rel="STYLESHEET" href="style.css" type="text/css"></link>
	<script src="../jquery-1.4.2.min.js"></script>
	<script src="../jquery.json-2.2.min.js"></script>
	<script src="../wiki.js"></script>
	<script src="../wikistyle.js"></script>
      </head>
      <body>
	<xsl:apply-templates />
      </body>
    </html>
  </xsl:template>

  <xsl:template match="document">
    <div class="type"><xsl:value-of select="@type" /></div>
    <!--<span><a href="./">list</a></span>-->
    <span id="today">create today's diary</span>
    <span><a><xsl:attribute name="href">../wikiedit.html#<xsl:value-of select="/document/user/text()"/>:<xsl:value-of select="/document/title/text()"/></xsl:attribute>edit</a></span>
    <xsl:apply-templates />
    <div id="menu"></div>
    <div id="body"></div>
    <hr/>
    <div class="footer">
      karuki 3 by <a href="http://d.hatena.ne.jp/inajob/">inajob</a>
    </div>
  </xsl:template>
  
  <xsl:template match="title">
    <h1 class="title"><xsl:apply-templates /></h1>
    <!--<a><xsl:attribute name="href">../wikiedit.html#<xsl:value-of select="/document/user/text()"/>:<xsl:apply-templates /></xsl:attribute>edit</a>-->
  </xsl:template>
  <xsl:template match="user">
  </xsl:template>
  <xsl:template match="body">
    <pre><xsl:apply-templates /></pre>
  </xsl:template>
</xsl:stylesheet>
