import boto3
import os

from ..apigateway import Response

def get_products(_):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('AmmyInventoryTable')

    s3_prefix = f"https://{os.environ['IMAGE_S3_PREFIX']}/"

    response = table.scan(AttributesToGet=[
                          'id', 'sku', 'product_name', 'img', 'inventory_status', 'inventory_level', 'inventory_value', 'remark'])

    items = [{**item, 'img': f"{s3_prefix}{item['img']}"}
             for item in response['Items']]

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        for item in response['Items']:
            items.append(item)

    return Response(status_code=200, body={'products': items})
