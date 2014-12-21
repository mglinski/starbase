# EVE Starbase Configurator

## Abstract
To provide an easily updated POS builder tool because all the other ones suck or are not open source :(

## Install
To build run the following to download the latest SDE and build the static.js file.

    (cd build && wget https://www.fuzzwork.co.uk/dump/sqlite-latest.sqlite.bz2 && tar -xvjf sqlite-latest.sqlite.bz2 && make)
    
Starbase is now built using bower and gulp, so either run the commands in the setup.sh file or run the command blow. You will need [Node.JS and NPM](https://docs.npmjs.com/getting-started/installing-node) installed to do this.

    (sudo npm install -g bower gulp && bower install && gulp)

## Contributing
Follow git-flow for contributing back changes.

## License
See the LICENSE file, project is licensed under the standard MIT License.