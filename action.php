<?php
  // start
require_once("twitteroauth/twitteroauth.php");
require_once("config.php");
// ############################
// CONSTANTS
// ############################

$consumer_key = TW_CONSUMER_KEY;
$consumer_secret = TW_CONSUMER_SECRET;


// ############################
// PARAMETER
// ############################

$method = $_GET['action'];

// ############################
// FILE ACCESS API
// ############################

function checkTitle($title){
  $count = preg_match('/^[a-zA-Z0-9%_]+$/',$title);
  return $count == 1;
}
function mkFileName($user,$title){
  if(checkTitle($title)){
    return $user .':' .$title.'.html';
  }
  return false;
}

function write($user,$title,$body,$type){
  error_log("write title ".$title);
  if(checkTitle($title)){
    $fname = DATA_PATH . mkFileName($user,$title);
    #$xml;
    if(file_exists($fname)){
      error_log('exist file '  . $fname);
      $xml = simplexml_load_string(file_get_contents($fname));
      # todo: check parmission
    }else{
      // new file
      error_log('new file ' . $rbody . " " . $fname);
    }

    $xml = new SimpleXmlElement('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja"></html>');
    $ehead = $xml->addChild('head');
    $ebody = $xml->addChild('body');
    $ehead->addChild('title',urldecode($title))->addAttribute('id','title');
    $ehead->addChild('script','')->addAttribute('src','../js/jquery-1.4.2.min.js');
    $ehead->addChild('script','')->addAttribute('src','../js/loader.js');
    $link = $ehead->addChild('link','');
    $link->addAttribute('rel','stylesheet');
    $link->addAttribute('type','text/css');
    $link->addAttribute('href','style.css');

    $ebody->addChild('pre',str_replace('&','&amp;',$body))->addAttribute('id','body');
    $ebody->addChild('div',$user)->addAttribute('id','user');
    $ebody->addChild('div',$type)->addAttribute('id','type');
    $ebody->addChild('div',time())->addAttribute('id','lastupdate');

    file_put_contents($fname,$xml->asXML());
    # exec mkrss
    #exec ("/usr/bin/php rsstest.php > rss.xml &");
    require("rsstest.php");
    error_log("title " . $title);
    $r = append($user,urlencode('/updates/' . strftime('%Y%m%d')), $title, 'wiki');
    if(!$r){
      error_log("error updates");
    }
    
    return true;
  }else{
    return false;
  }
}

function append($user,$title,$body,$type){
  $rbody = "";
  error_log("append title ".$title);
  if(checkTitle($title)){
    $fname = DATA_PATH . mkFileName($user,$title);
    if(file_exists($fname)){
      $xml = simplexml_load_string(file_get_contents($fname));
      # todo: check parmission
      if($xml->body->div[1] != "wiki"){
	error_log('not wiki error');
	return false;
      }
      $rbody = $xml->body->pre;
      error_log('load file ' . $rbody);
    }else{
      // new file
      error_log($title);
      error_log('new file ' . $rbody . " " . $fname);
    }
    $xml = new SimpleXmlElement('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja"></html>');
    $ehead = $xml->addChild('head');
    $ebody = $xml->addChild('body');
    $ehead->addChild('title',urldecode($title))->addAttribute('id','title');
    $ehead->addChild('script','')->addAttribute('src','../js/jquery-1.4.2.min.js');
    $ehead->addChild('script','')->addAttribute('src','../js/loader.js');
    $link = $ehead->addChild('link','');
    $link->addAttribute('rel','stylesheet');
    $link->addAttribute('type','text/css');
    $link->addAttribute('href','style.css');

    $ebody->addChild('pre',str_replace('&','&amp;',$rbody . "\n" . $body))->addAttribute('id','body');
    $ebody->addChild('div',$user)->addAttribute('id','user');
    $ebody->addChild('div',$type)->addAttribute('id','type');
    $ebody->addChild('div',time())->addAttribute('id','lastupdate');

    file_put_contents($fname,$xml->asXML());

    #require("rsstest.php");
    return true;
  }else{
    error_log('title error');
    return false;
  }
}

// ############################
// DISPATCHER
// ############################

if($method == "login"){
  # ---- LOGIN ----
  session_start();
  if(
     (!isset($_SESSION['oauth_token']) || $_SESSION['oauth_token']===NULL) &&
     (!isset($_SESSION['oauth_token_secret']) || $_SESSION['oauth_token_secret']===NULL)
     ){
    $to = new TwitterOAuth($consumer_key,$consumer_secret);
    $title = $_GET['title'];
    
    #echo $title;
    $tok = $to->getRequestToken('http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'] . "?action=callback");
    #$tok = $to->getRequestToken(BASE_URL . "action.php?action=callback");
    // todo:set redirect url ?
    #echo '*'.$_SERVER['HTTP_REFERER'].'*';
    $_SESSION['redirect'] = $_SERVER['HTTP_REFERER'] . '#' . $title;
    $_SESSION['request_token'] = $token = $tok['oauth_token'];
    $_SESSION['request_token_secret'] = $tok['oauth_token_secret'];
    $url = $to->getAuthorizeURL($token);
    header('Location: '.$url);
    #echo "<a href='" . $url . "'>sign in</a><br>" . $title;
  }else{
    echo "something wrong";
  }
 }elseif($method == "callback"){
   # ---- LOGIN CALLBACK ----
   session_start();
   if(
       (isset($_SESSION['request_token']) && $_SESSION['request_token']!==NULL) &&
       (isset($_SESSION['request_token_secret']) && $_SESSION['request_token_secret']!==NULL) &&
       (isset($_GET['oauth_verifier']) && $_GET['oauth_verifier']) &&
       (!isset($_SESSION['user_id']) || $_SESSION['user_id']===NULL)
     ){
     $title = $_GET['title'];
     $verifier = $_GET['oauth_verifier'];
     $to = new TwitterOAuth($consumer_key,$consumer_secret,$_SESSION['request_token'],$_SESSION['request_token_secret']);
     //var_dump($to->get("account/verify_credentials"));
     $access_token = $to->getAccessToken($verifier);
     #var_dump($access_token);
     
     #var_dump($_SESSION);
     $_SESSION['oauth_token'] = $access_token['oauth_token'];
     $_SESSION['oauth_token_secret'] = $access_token['oauth_token_secret'];
     
     $_SESSION['user_id'] = $access_token['user_id'];
     $_SESSION['screen_name'] = $access_token['screen_name'];
     
     header('Location: '.$_SESSION['redirect']);

     echo "<div>welcome ".$_SESSION['screen_name']."</div>";
     echo "<h2><a href='" . $_SESSION['redirect'] . "'>go</a></h2>";
     echo "<a href='data'>list</a>";
     #echo "<pre>";
     #print_r($_SESSION);
     #echo "</pre>";
     unset($_SESSION['redirect_url']);
     
   }elseif(isset($_SESSION['user_id']) && $_SESSION['user_id'] !== NULL){
     ## ---- RE CALLBACK ---- ( unusual )
     echo "reconnect " . $_SESSION['screen_name'];
   }else{
     echo "unknown error";
   }
  }elseif($method == "logout"){
    # ---- LOGOUT ----
    session_start();
    session_destroy();
    echo "logout";
   }elseif($method == "check"){
     # ---- CHECK ----
     session_start();
     
     if(isset($_SESSION['user_id']) && $_SESSION['user_id'] !== NULL){
       echo json_encode(array(
			      "user_id" => $_SESSION['user_id'],
			      "screen_name" => $_SESSION['screen_name']
			      ));
     }else{
       echo json_encode(array());
     }
    }elseif($method == "save"){
      # ---- SAVE ----
      session_start();
      if(get_magic_quotes_gpc()){
	#echo json_encode(array(
	#		       'error' => 'environment error'
	#		       ));
	#return; # environment error
      }
      if(isset($_SESSION['user_id']) && $_SESSION['user_id'] !== NULL){
      # login
	if(!isset($_REQUEST['title']) || !isset($_REQUEST['body']) || !isset($_REQUEST['type'])){
	  echo json_encode(array(
				 'error' => 'parameter error'
				 ));
	  return;
	}
	$user_id = "tw:"+$_SESSION['user_id'];
	if(get_magic_quotes_gpc()){
		$title = stripslashes($_REQUEST['title']);  # todo:sanitize
		$type = stripslashes($_REQUEST['type']);  # todo:sanitize
		$body = stripslashes($_REQUEST['body']); # todo sanitize?
	}else{
		$title = $_REQUEST['title'];  # todo:sanitize
		$type = $_REQUEST['type'];  # todo:sanitize
		$body = $_REQUEST['body']; # todo sanitize?
	}
      
        # todo: new line normalize
	
	if(!checkTitle($title)){
	  echo json_encode(array(
				 'error' => 'invalid title'
				 ));
	  return;
	}
	if(write($user_id,$title,$body,$type)){
	  echo json_encode(array(
				 'success' => 'ok',
				 'body' => $body,
				 'pre' => $_REQUEST['body']
				 ));
	}else{
	  echo json_encode(array(
				 'error' => 'write'
				 ));
	  
	}
      }elseif($method == "append"){
	# ---- APPEND ----
	session_start();
	if(isset($_SESSION['user_id']) && $_SESSION['user_id'] !== NULL){
        # login
	  if(!isset($_REQUEST['title']) || !isset($_REQUEST['body']) || !isset($_REQUEST['type'])){
	    echo json_encode(array('error' => 'parameter error'));
	    return;
	  }
	  $user_id = "tw:"+$_SESSION['user_id'];
	  if(get_magic_quotes_gpc()){
	    $title = stripslashes($_REQUEST['title']);  # todo:sanitize
	    $type = stripslashes($_REQUEST['type']);  # todo:sanitize
	    $body = stripslashes($_REQUEST['body']); # todo sanitize?
	  }else{
	    $title = $_REQUEST['title'];  # todo:sanitize
	    $type = $_REQUEST['type'];  # todo:sanitize
	    $body = $_REQUEST['body']; # todo sanitize?
	  }
	  
	  if(!checkTitle($title)){
	    echo json_encode(array('error' => 'invalid title'));
	    return;
	  }
	  if(append($user_id,$title,$body,$type)){ // API
	    echo json_encode(array(
				   'success' => 'ok',
				   //'body' => $body,
				   //'pre' => $_REQUEST['body']
				   ));
	  }else{
	    echo json_encode(array('error' => 'append'));
	  }
	}
      }else{
        # error (not login)
	echo json_encode(array());
      }
     }else{
  # ---- UNKOWN ----
  echo "unknown method";
 }

?>
