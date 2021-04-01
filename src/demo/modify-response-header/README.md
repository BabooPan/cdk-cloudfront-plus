# How to Test

```sh
yarn watch
```

Open a seperate terminal and run:

```sh
AWS_REGION=us-east-1 cdk --app lib/demo/modify-response-header/index.js deploy
```

On deploy completed, open the cloudfront URL with

```text
http://<CLOUDFRONT_DOMAIN>
```

You should be able to see the response with specific status code from lambda function.
