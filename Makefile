.PHONY: all clean install

IN = server.cgi
OUT = index.cgi

PERL_PATH_DEBUG   = E:/ActivePerl/bin/perl.exe
PERL_PATH_RELEASE = /usr/bin/perl
FTP = ~/c/WINDOWS/System32/ftp.exe

all: $(OUT)

clean:
	rm -f $(OUT)

debug:
	echo "#!$(PERL_PATH_DEBUG)" > $(OUT)
	echo "$$debug=1;"          >> $(OUT)

release:
	echo "#!$(OUT_PERL_RELEASE)" > $(OUT)
	echo "$$debug=0;"           >> $(OUT)

$(OUT): $(IN) $(RLINE)
	cat $(IN) >> $(OUT)

installlocal:
	cp $(OUT) ~/d/www/4dsoko/server/

installbeta:
	$(FTP) -s:uploadbeta.ftp

install:
	$(FTP) -s:upload.ftp

