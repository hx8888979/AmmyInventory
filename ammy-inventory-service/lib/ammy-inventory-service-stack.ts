import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaIntegration, RestApi, Cors, RequestAuthorizer, IdentitySource } from 'aws-cdk-lib/aws-apigateway';
import { Distribution, ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';


export class AmmyInventoryServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const inventoryTable = new ddb.Table(this, 'AmmyInventoryTable', {
      tableName: 'AmmyInventoryTable',
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const userTable = new ddb.Table(this, 'AmmyUserTable', {
      tableName: 'AmmyUserTable',
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const imageBucket = new Bucket(this, 'AmmyImageBucket', {
      bucketName: 'ammy-image-bucket',
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
          allowedOrigins: ['https://inventory.ammy.studio'],
        }
      ]
    });

    const cloudfront = new Distribution(this, "cdnDistribution", {
      defaultBehavior: {
        origin: new S3Origin(imageBucket),
        responseHeadersPolicy: new ResponseHeadersPolicy(this, "cdnResponseHeadersPolicy", {
          corsBehavior: {
            originOverride: true,
            accessControlAllowHeaders: ['*'],
            accessControlAllowOrigins: ['https://inventory.ammy.studio'],
            accessControlAllowMethods: [HttpMethods.GET, HttpMethods.HEAD],
            accessControlAllowCredentials: false
          }
        })
      }
    });

    const lambdaFunction = new lambda.Function(this, 'AmmyInventoryService', {
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 512,
      handler: "ammy_inventory.lambda_handler",
      code: lambda.Code.fromAsset('./build/build.zip'),
      environment: {
        'IMAGE_S3_PREFIX': cloudfront.distributionDomainName,
      }
    });

    inventoryTable.grantReadWriteData(lambdaFunction);
    imageBucket.grantReadWrite(lambdaFunction);
    userTable.grantReadData(lambdaFunction);

    const apigateway = new RestApi(this, 'AmmyInventoryServiceAPI', {
      restApiName: 'AmmyInventoryServiceAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://inventory.ammy.studio'],
        allowCredentials: true,
      },
    });

    const authorizer = new RequestAuthorizer(this, 'AmmyInventoryServiceAuthorizer', {
      handler: lambdaFunction,
      identitySources: [IdentitySource.header('Cookie')],
      resultsCacheTtl: cdk.Duration.seconds(3600),
    });

    const login = apigateway.root.addResource('login');
    login.addMethod('POST', new LambdaIntegration(lambdaFunction));

    const products = apigateway.root.addResource('products');
    products.addMethod('GET', new LambdaIntegration(lambdaFunction), { authorizer });
    products.addMethod('POST', new LambdaIntegration(lambdaFunction), { authorizer });
    const product = products.addResource('{product_id}');
    product.addMethod('PATCH', new LambdaIntegration(lambdaFunction), { authorizer });
    product.addMethod('DELETE', new LambdaIntegration(lambdaFunction), { authorizer });

    const records = product.addResource('records');
    records.addMethod('GET', new LambdaIntegration(lambdaFunction), { authorizer });
    records.addMethod('POST', new LambdaIntegration(lambdaFunction), { authorizer });
    const record = records.addResource('{record_id}');
    record.addMethod('PATCH', new LambdaIntegration(lambdaFunction), { authorizer });
    record.addMethod('DELETE', new LambdaIntegration(lambdaFunction), { authorizer });
  }
}
