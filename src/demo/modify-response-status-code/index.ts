import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as extensions from '../../extensions';
import * as fs from 'fs';
import * as path from 'path';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'demo-repscode');

// create the cloudfront distribution with extension(s)
const modifyResponseStatusCode = new extensions.ModifyResponseStatusCode(stack, 'repsCode');
new cdk.CfnOutput(stack, 'functionVersion', { value: modifyResponseStatusCode.functionArn});

// create Demo S3 Bucket.
const bucket = new s3.Bucket(modifyResponseStatusCode, 'demoBucket', {
  autoDeleteObjects: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  websiteIndexDocument: 'index.html',
  // websiteErrorDocument: 'index.html',
});

// create index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), '<h1>Hello CDK!!</h1>');

// put index.html to bucket
new BucketDeployment(modifyResponseStatusCode, 'Deployment', {
  sources: [Source.asset(path.join(__dirname, './'))],
  destinationBucket: bucket,
  retainOnDelete: false,
});

// CloudFront OriginAccessIdentity for Bucket
const originAccessIdentity = new cf.OriginAccessIdentity(modifyResponseStatusCode, 'OriginAccessIdentity', {
  comment: `CloudFront OriginAccessIdentity for ${bucket.bucketName}`,
});

// CloudfrontWebDistribution
const dist = new cf.CloudFrontWebDistribution(stack, 'CloudFrontWebDistribution', {
  originConfigs: [
    {
      s3OriginSource: {
        originAccessIdentity,
        s3BucketSource: bucket,
      },
      behaviors: [{
        isDefaultBehavior: true,
        lambdaFunctionAssociations: [{
          eventType: modifyResponseStatusCode.eventType,
          lambdaFunction: modifyResponseStatusCode.functionVersion
        }],
      }],
    },
  ],
});
new cdk.CfnOutput(stack, 'distDomainName', {
  value: dist.distributionDomainName,
});
