.PHONY: clean build run

clean:
	rm -rf ./dist

build: clean
	@echo "-> Building image..."
	@parcel build index.html

cleanS3:
	@echo "-> Scrubbing S3..."
	aws s3 rm s3://tomarrell.com --recursive
	@echo "-> S3 clean..."

upload: build cleanS3
	@echo "-> Copying built files to S3..."
	aws s3 cp ./dist s3://tomarrell.com --recursive --acl public-read
	aws s3 cp ./dist/index.html s3://tomarrell.com \
		--cache-control max-age=0 \
		--acl public-read
