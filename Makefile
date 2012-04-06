.PHONY: all clean install

IN = server.cgi
TMP = tmp
OUT = index.cgi

PERL_PATH_DEBUG   = E:/ActivePerl/bin/perl.exe
PERL_PATH_RELEASE = /usr/bin/perl
FTP = ~/c/WINDOWS/System32/ftp.exe

all: debug

clean:
	rm -f $(OUT)

debug:
	echo "#!$(PERL_PATH_DEBUG)" > tmp2
	cat tmp2 dollor.txt > tmp
	rm tmp2
	echo "debug=1;" >> tmp
	cat $(IN) >> tmp
	mv tmp index.cgi

release:
	echo "#!$(PERL_PATH_RELEASE)" > tmp2
	cat tmp2 dollor.txt > tmp
	rm tmp2
	echo "debug=0;" >> tmp
	cat $(IN) >> tmp
	mv tmp index.cgi

installlocal:
	cp *.js *.html ~/d/www/4dsoko/
	cp $(OUT) ~/d/www/4dsoko/server/

installbeta:
	$(FTP) -s:uploadbeta.ftp

install:
	$(FTP) -s:upload.ftp

