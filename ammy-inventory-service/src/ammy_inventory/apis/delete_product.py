import boto3

from ammy_inventory.apigateway import Response


def delete_product(payload):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')

        response = table.get_item(
            Key={'id': payload['product_id']}, AttributesToGet=['img'])
        if 'Item' not in response:
            return Response(status_code=404, body={'message': 'not found'})
        product = response['Item']

        table.delete_item(Key={'id': payload['product_id']})

        s3 = boto3.resource('s3')
        s3.Bucket('ammy-image-bucket').delete_objects(
            Delete={
                'Objects': [{
                    'Key': product['img'],
                }]
            }
        )

        return Response(status_code=200, body={'message': 'ok'})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})
