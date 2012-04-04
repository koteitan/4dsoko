#!E:/ActivePerl/bin/perl.exe
#  utan index.cgi -- URL 短縮 utan 

# 設定 begin ---------
$topurl      = "http://localhost/ut/"; # トップページの URL
$title       = "URL 短縮 utan";        # タイトル
$listfile    = "db/list.dat";          # データベースの場所
$counterfile = "db/count.dat";         # カウンタの場所
$algoversion = "a"; # 短縮アルゴリズムとアルゴリズムのバージョン。
                    # (短縮アルゴリズムを変えたら文字をインクリメントして下さい)
# 設定 end ---------

$errormsg = "";
if($ENV{"REQUEST_METHOD"} eq "GET"){
  # ----------------------------------------------------
  # http GET (トップページ or リダイレクト)
  # ----------------------------------------------------
  $queries = $ENV{"QUERY_STRING"};
  $short_url = "";
  if($queries =~ /(short_url\=)(.*)$/){
    # クエリに short_url が見つかった
    $short_url = $2;
    if($short_url eq "list"){
      # クエリ short_url が "list" なら短縮 URL のリストを表示して終わる
      printList();
      exit(0);
    }
    if($short_url ne ""){
      # short_url が "" でない
      $long_url = &searchShorted($short_url);
      if($long_url ne ""){
        # listfile に short_url が見つかった
        $decodedlong_url = &url_decode($long_url); # URL デコード
#        print "Content-type: text/html; charset=shift-jis\n\n"; # debug
        print "Location: $decodedlong_url\n\n"; # リダイレクト 
        exit(0);
      }else{
        # listfile に short_url が見つからない
        $title = "$title - error: 短縮 URL がみつかりません";
        $errormsg = "$errormsg<p>error: 短縮 URL \n";
        $errormsg = "$errormsg<kbd>\"$short_url\"</kbd>\n";
        $errormsg = "$errormsgはまだ登録されていません。</p>\n";
      }
    }
  }else{
    if($queries ne ""){
      $title = "$title - error: アクセス方法が何か違います";
      $errormsg = "$errormsg<p>GET 時の QUERT_STRING は \"\" か \"short_url=XXX\" のはずですが、<br>\n";
      $errormsg = "$errormsg<kbd>QUERT_STRING = \"$queries\"</kbd><br>を受けました。\n";
    }
  }
  # クエリに short_url が見つからなかった、または、
  # listfile に short_url が見つからなかった
  printTop();# トップページを表示
  exit(0);
  
}else{
  # ----------------------------------------------------
  # http POST (短縮依頼) 
  # ----------------------------------------------------
  read (STDIN, $postedData, $ENV{'CONTENT_LENGTH'});
  $long_url = "";
  if($postedData =~ /(long_url\=)(.*)$/){
    # クエリに long_url があった
    $long_url = $2;
  }
  if($long_url eq "http%3A%2F%2F"){
    # クエリに long_url = "http://" だった
    $title = "$title - error: http:// の続きも入力して下さい";
    $errormsg = "$errormsg<p>http:// の続きも入力して下さい</p>\n";
    printTop(); # トップページを表示
    exit(0);
  }
  if($long_url ne ""){
    # クエリに long_url がある
    $short_url = &searchLongURI($long_url);
    if($short_url ne ""){
      # listfile に long_url が見つかった
      # 短縮 URL を表示
      printFound();
      exit(0);
    }else{  # if($short_url ne "")
      # listfile に long_url がないので新規登録
      $decodedurl = &url_decode($long_url);
      if( $decodedurl !~ /\:\/\//){
        # :// がなければ http:// を補完
        $long_url = "http%3A%2F%2F$long_url";
      }
      if(!(-f $counterfile)){
        # counterfile がなかったので今作りました
        open FW, ">$counterfile";
        print FW "0\n";
        close FW;
      }
      # カウンタ読み込み
      open FR, "<$counterfile";
      $count = <FR>;
      close FR;
      $count++;
      # 短縮アルゴリズム
      $short_url = &shorten($count, $long_url);
      # データベースに追加
      open FW, ">>$listfile";
      print FW "$short_url, $long_url\n";
      close FW;
      # カウンタファイルを更新
      open FW, ">$counterfile";
      print FW "$count\n";
      close FW;
      # ページ表示
      printNew();
      exit(0);
    }# if($short_url ne "")
  }else{# ($long_url ne "")
    # クエリに long_url がない
    $title = "$title - error: アクセス方法が何か違います";
    $errormsg = "$errormsg<p>POST 時の CONTENT は \"long_url=XXX\" \"long_url!=http://\" のはずですが、<br>\n";
    $errormsg = "$errormsg<kbd>CONTENT = \"$postedData\"</kbd><br>を受けました。\n";
    printTop(); # トップページを表示
    exit(0);
  }
}

# sub searchShorted
# usage   : $short_url = &searchLongURI($long_url);
# action  : ファイル $listfile から $short_url を探し、対応する $long_url を返します。
# param  : $short_url = 探す短縮 URL の可変部分
# returns: $long_url = 対応する長い URI。$short_url が見つからなければ ""
sub searchShorted{
  my ($_short_url) = @_;
  my $_long_url   = "";
  if(!(-f $listfile)){
    # $listfile がなかったので今作りました
    open FW, ">$listfile";
    close(FW);
  }
  open FR, "<$listfile";
  foreach $line (<FR>){
    if($line =~/^($_short_url)(\,\s)(.*)$/){
      # みつかった
      $_long_url = $3;
    }
  }
  return $_long_url;
}

# sub searchLingURI
# usage   : $short_url = &searchLongURI($long_url);
# action  : ファイル $listfile から $long_url を探し、対応する $short_url を返します。
# param   : $long_url = 探す長い URI
# short_url : $short_url = 対応する短縮 URL の可変部分。$linguri が見つからなければ ""
sub searchLongURI{
  my ($_long_url) = @_;
  my $_short_url   = "";
  if(!(-f $listfile)){
    # $listfile がなかったので今作りました
    open FW, ">$listfile";
    close(FW);
  }
  open FR, "<$listfile";
  foreach $line (<FR>){
    if($line =~/^(.*)(\,\s)($_long_url)$/){
      # みつかった
      $_short_url = $1;
    }
  }
  return $_short_url;
}

# sub shorten 短縮アルゴリズム
# usage   : $short_url = &shorten($count, $long_url);
# action  : $long_url を短縮して新しい $short_url を返します
# param   : $count   = 新規登録後の登録 URL 総数。
# short_url : $long_url = 対応する短縮 URL の可変部分。$linguri が見つからなければ ""
sub shorten{
  my ($_count, $_long_url) = @_;
  # 単に並べるだけのアルゴリズム
  return "$algoversion$_count";
}

#URL エンコード
sub url_encode($) {
  my $str = shift;
  $str =~ s/([^\w ])/'%'.unpack('H2', $1)/eg;
  $str =~ tr/ /+/;
  return $str;
}
#URL デコード
sub url_decode($) {
  my $str = shift;
  $str =~ tr/+/ /;
  $str =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;
  return $str;
}

# トップページの表示
# $errormsg
sub printTop{
  $listlink = $topurl."list";
#.....................................
  print <<"HTML_TOPPAGE";
Content-type: text/html; charset=shift-jis

<html><head><title>$title</title></head>
<body>
<h1>$title</h1>
<form name="post_long2short" method="post" action="index.cgi">
Long URL = <textarea name="long_url" rows="8" cols="64" style="overflow:visible">http://</textarea>
<input type="submit" value="短縮する">
</form>
<p><a href="$listlink">リストを表\示する</a></p>
$errormsg
</body></html>
HTML_TOPPAGE
#.....................................
  return;
}

sub printList{
  if(!(-f $listfile)){
    # $listfile がなかったので今作りました
    open FW, ">$listfile";
    close(FW);
  }
  my $list = "";
  open FR, "<$listfile";
  foreach $line (<FR>){
    if($line =~/^(.*)(\,\s)(.*)$/){
      # みつかった
      my $_short_url = $1;
      my $decodedurl = url_decode($3);
      $list = "$list<li><a href=\"$topurl$_short_url\">$topurl$_short_url</a> = <a href=\"$decodedurl\">$decodedurl</a></li>\n";
    }
  }
  close(FR);
#.....................................
print <<"HTML_LIST";
Content-type: text/html; charset=shift-jis

<html><head><title>$title - 短縮 URL リスト</title></head>
<body>
<h1>$title - 短縮 URL リスト</h1>
<a href="$topurl">戻る</a>
<ul>
$list
</ul>
</body></html>
HTML_LIST
#.....................................
}

sub printFound{
#.....................................
print <<"HTML_LIST";
Content-type: text/html; charset=shift-jis

<html><head><title>$title</title></head>
<body>
<h1>$title</h1>
<p>その Long URL は既に登録されていました。<br>短縮 URL は <a href="$topurl$short_url">$topurl$short_url</a> です。</p>
</body></html>
HTML_LIST
#.....................................
}

sub printNew{
#.....................................
print <<"HTML_NEW";
Content-type: text/html; charset=shift-jis

<html><head><title>$title</title></head>
<body>
<h1>$title</h1>
<p>新規登録しました。<br>短縮 URL は <a href=\"$topurl$short_url\">$topurl$short_url</a> です。</p>
</body></html>
HTML_NEW
#.....................................
}
