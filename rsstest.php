<?php
require_once("config.php");

$files = glob( 'data/*.html');
$flist = array();
foreach($files as $f){
  $m = filemtime($f);
  $flist[$f] = $m;
}
asort($flist);

$all = $flist; // copy

$alls = "";
foreach($all as $f => $d){
  $alls .= substr($f, strlen("data/"))."\n";
}
file_put_contents("files.list", $alls);

$flist = array_slice($flist,-30);
arsort($flist);
#print_r($flist);

$title = "karuki";
$link = BASE_URL . "/data/5643382%3AFrontPage.html";
$desc = "karuki JavaScript base wiki system";
$pubDate = "";
$gen = "";

# HEADER
$out = <<< EOS
<?xml version="1.0" encoding="UTF-8" ?> 
<?xml-stylesheet href="rss.xsl" type="text/xsl" media="screen"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>{$title}</title>
<link>{$link}</link>
<description>{$desc}</description>
<pubDate>{$pubDate}</pubDate>
<generator>{$gen}</generator>
<language>ja</language>
EOS;


foreach($flist as $f => $m){
  #echo "========\n";
  $xml = simplexml_load_string(file_get_contents($f));
  $title = ''.($xml->head->title);
  $body = mb_ereg_replace('\n','<br />',''.($xml->body->pre));
  $rbody = '' . ($xml->body->pre) . '';
  $date = strftime("%a, %d %b %Y %H:%M:%S +0000",$m);
  $url = BASE_URL .  str_replace(':','%3A', str_replace('%', '%25', $f));
  $creator = "karuki3";
   $out .= <<< EOS
<item>
<title>{$title}</title>
<link>{$url}</link>
<pubDate>{$date}</pubDate>
<dc:creator>{$creator}</dc:creator>
<guid isPermaLink="true">{$url}</guid>
<content:encoded><![CDATA[{$body}]]></content:encoded>
<description><![CDATA[{$body}]]></description>
</item>
EOS;
}

# FOOTER
$out .= <<< EOS
</channel>
</rss>
EOS;
file_put_contents("rss.xml", $out);
?>
