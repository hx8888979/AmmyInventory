import boto3

from ammy_inventory.apigateway import Response
from ammy_inventory.apis.models.images import update_image
from ammy_inventory.apis.models.products import Product


def update_product(payload):
    try:
        payload: Product = Product.from_dict(payload)

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('AmmyInventoryTable')

        try:
            table.update_item(
                Key={'id': payload.product_id},
                UpdateExpression="set sku = :sku, product_name = :product_name, remark = :remark",
                ConditionExpression="id = :id",
                ExpressionAttributeValues={
                    ':sku': payload.sku, ':product_name': payload.name, ':remark': payload.remark, ':id': payload.product_id},
            )
        except Exception:
            return Response(status_code=404, body={'message': 'not found'})

        update_image(payload.img, payload.product_id, boto3.session.Session())

        return Response(status_code=200, body={'id': payload.product_id})

    except Exception as e:
        return Response(status_code=400, body={'message': 'Invalid Request'})
