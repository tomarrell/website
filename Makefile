.PHONY: clean
clean: ## Clean the local dir of build files
	rm -rf ./dist

.PHONY: build
build: clean ## Build the site using the Parcel bundler
	@echo "-> Building image..."
	@parcel build index.html

.PHONY: cleanS3
cleanS3: ## Remove all the files in the S3 bucket
	@echo "-> Scrubbing S3..."
	aws s3 rm s3://tomarrell.com --recursive
	@echo "-> S3 clean..."

.PHONY: upload
upload: build cleanS3 ## Build and upload the files to the S3 bucket
	@echo "-> Copying built files to S3..."
	aws s3 cp ./dist s3://tomarrell.com --recursive --acl public-read
	aws s3 cp ./dist/index.html s3://tomarrell.com \
		--cache-control public,max-age=86400 \
		--acl public-read

## Help display.
## Pulls comments from beside commands and prints a nicely formatted
## display with the commands and their usage information.

.DEFAULT_GOAL := help

help: ## Prints this help
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

