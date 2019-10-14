<?php

function entity_to_utf8($str){
  $convmap = array ( 0x0000, 0xffff, 0x0000, 0xffff );
  $str = preg_replace( '/&#x([0-9a-fA-F]+);/e', '"&#" . hexdec( "\\1" ) . ";"', $str );
  return mb_decode_numericentity ( $str, $convmap, 'UTF-8' );
  }

function utf8_to_entity($str){
  $convmap = array ( 0x00ff, 0x10ffff, 0x0000, 0xffffff );
  $str =  mb_encode_numericentity ( $str, $convmap, 'UTF-8' );
  $str = preg_replace( '/&#([0-9]+);/e', '"&#x" . strtoupper(dechex( "\\1" )) . ";"', $str );
  return $str;
}

$q = $_GET['q'];
#$q="日本語";
$q = utf8_to_entity($q);
$q = preg_replace('/"/', '\"', $q);
$q = preg_replace('/\\\\/', '\\', $q);

#echo 'grep "'. $q .'" data/*.html' . "\n\n";

exec('grep "'. $q .'" data/*.html', $out);
$ret = array();
foreach($out as $l){
#echo $l."\n";
  $r = preg_match('/data\/(\d+:.*?\.html):(.*)/',$l,$matches);
#print_r($matches);
  $content = preg_replace('/^<[\w\W]*>|<[\w\W]*>$/', '', $matches[2]);
#echo $matches[1] . " : ";
  array_push($ret, array($matches[1], entity_to_utf8($content)));
}

#print_r($ret);
echo json_encode($ret);
?>