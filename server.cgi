#  4dsoko level server

$errormsg = "";
if($ENV{"REQUEST_METHOD"} eq "POST"){
  read (STDIN, $postedData, $ENV{'CONTENT_LENGTH'});
  $name = "";
  if($postedData =~ /(name\=)([\w]*)/){
    # query "name" is found
    $name = $2;
  }
  if($postedData =~ /(data\=)(.*)$/){
    # query "data" is found
    $data = url_decode($2);
  }
  if($name ne ""){
    if(!(open FW, ">$name")){
      print "Content-type: text/plain; charset=utf-8\n\nerror:$!\n";
      exit(0);
    };
    print FW $data;
    close(FW);
    print "Content-type: text/plain; charset=utf-8\n\nok\nname=$name\ndata=$data\n$!";
    exit(0);
  }else{
    print "Content-type: text/plain; charset=utf-8\n\nok\nname=$name\ndata=$data\n 2222 ";
    exit(0);
  }
}elsif($ENV{"REQUEST_METHOD"} eq "GET"){
  # get 
  if(open FR, "<$ENV{'QUERY_STRING'}"){
    print "Access-Control-Allow-Origin:$ENV{'SERVER_NAME'}\r\n";
    print "Content-type: application/json; charset=utf-8\r\n\r\n";
    print <FR>;
    exit(0);
  }else{
    print "Access-Control-Allow-Origin:$ENV{'SERVER_NAME'}\r\n";
    print "Content-type: application/json; charset=utf-8\r\n\r\n";
    print "\"error:$!'".$ENV{'QUERY_STRING'}."'\"";
    exit(0);
  }
}

#URL encode
sub url_encode($) {
  my $str = shift;
  $str =~ s/([^\w ])/'%'.unpack('H2', $1)/eg;
  $str =~ tr/ /+/;
  return $str;
}
#URL decode
sub url_decode($) {
  my $str = shift;
  $str =~ tr/+/ /;
  $str =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;
  return $str;
}



