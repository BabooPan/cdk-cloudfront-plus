import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as cf from '@aws-cdk/aws-cloudfront';
import * as extensions from '../../extensions';
import * as fs from 'fs';
import * as path from 'path';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'demo-update-error-reps');

// create the cloudfront distribution with extension(s)
const updateErrorStatusCode = new extensions.UpdateErrorStatusCode(stack, 'UpdateErrorStatusCode');

// create Demo S3 Bucket.
const bucket = new s3.Bucket(updateErrorStatusCode, 'demoBucket', {
  autoDeleteObjects: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  websiteIndexDocument: 'index.html',
});
  
// create index.html in the demo folder
fs.writeFileSync(path.join(__dirname, 'index.html'), '<h1>Hello CDK!</h1>');

// Put index.html to Bucket.
new BucketDeployment(updateErrorStatusCode, 'Deployment', {
  sources: [Source.asset(path.join(__dirname, './'))],
  destinationBucket: bucket,
  retainOnDelete: false,
});
  
// CloudFront OriginAccessIdentity for Bucket
const originAccessIdentity = new cf.OriginAccessIdentity(updateErrorStatusCode, 'OriginAccessIdentity', {
  comment: `CloudFront OriginAccessIdentity for ${bucket.bucketName}`,
});

// cloudfront distribution
const distribution = new cf.CloudFrontWebDistribution(stack, 'distribution', {
  originConfigs: [
    {
      s3OriginSource: {
        originAccessIdentity,
        s3BucketSource: bucket,
      },
      behaviors: [{
        isDefaultBehavior: true,
        lambdaFunctionAssociations: [
          updateErrorStatusCode
        ],
      }],
    },
  ],
});

new cdk.CfnOutput(stack, 'distributionDomainName', {
  value: distribution.distributionDomainName,
});
