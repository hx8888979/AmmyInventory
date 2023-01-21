import boto3
import json

from ammy_inventory.apigateway import Response

def get_records(payload):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('AmmyInventoryTable')
    
    response = table.get_item(Key={'id': payload['product_id']}, AttributesToGet = ['records'])
    if 'Item' in response:
        product = response['Item']
        records = json.loads(product['records'])
        return Response(status_code=200, body={'records': records})
    else:
        return Response(status_code=404, body={'message': 'not found'})
