# Starbase makefile.
# Generate the app javascript file from the static javascript data dump and the app source code.

default: static.js install

static.js: gen-static.py sqlite-latest.sqlite
	./gen-static.py > $@

install:
	mv static.js ../src/js