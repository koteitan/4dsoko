.PHONY: all clean install

IN = server/server.cgi
OUT = server/index.cgi

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
	mv tmp $(OUT)

release:
	echo "#!$(PERL_PATH_RELEASE)" > tmp2
	cat tmp2 dollor.txt > tmp
	rm tmp2
	echo "debug=0;" >> tmp
	cat $(IN) >> tmp
	mv tmp $(OUT)

installlocal:
	cp *.js *.html ~/d/www/4dsoko/
	cp $(OUT) ~/d/www/4dsoko/

installbeta:
	$(FTP) -s:server/uploadbeta.ftp

install:
	$(FTP) -s:server/upload.ftp

