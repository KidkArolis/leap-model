BIN = ./node_modules/.bin

SRC = lib leap-model.js compat.js
TESTS = test

.PHONY: test

test:
	$(BIN)/jshint --reporter node_modules/jshint-stylish/stylish.js $(SRC)
	$(BIN)/jscs $(SRC)
	npm test