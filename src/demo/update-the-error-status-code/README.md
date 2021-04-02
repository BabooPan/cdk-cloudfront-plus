# How to Test

```sh
$ yarn watch
11:50:43 AM - File change detected. Starting incremental compilation...
11:50:45 AM - Found 0 errors. Watching for file changes.
...
...
```

Open a seperate terminal and run:

```sh
$ AWS_REGION=us-east-1 cdk --app lib/demo/update-the-error-status-code/index.js diff
```

On deploy completed, open the cloudfront URL with

```sh
# access the path with object existed in s3 bucket
$ curl http://<CLOUDFRONT_DOMAIN>
<h1>Hello CDK!</h1>
# access the path with object un-existed in s3 bucket
$ curl http://<CLOUDFRONT_DOMAIN>/123
Sorry, this accessment with some problems.
```

You should be able to see the response with specific status code from lambda function.
