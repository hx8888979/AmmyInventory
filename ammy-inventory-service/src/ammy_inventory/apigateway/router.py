from .utils import app
from .binding import init
from .authorizer import lambda_handler as authorizer

def lambda_handler(event, context):
    if 'type' in event and event['type'] == 'REQUEST':
        return authorizer(event, context)
    else:
        init()
        return app.resolve(event, context)