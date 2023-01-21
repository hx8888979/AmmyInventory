import decimal
import json
from typing import Dict, List, Optional, Union
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, Response as BaseResponse
from aws_lambda_powertools.shared.cookies import Cookie, SameSite

app = APIGatewayRestResolver()
default_headers = {
    'Access-Control-Allow-Origin': 'https://inventory.ammy.studio',
    'Access-Control-Allow-Credentials': 'true'
}


def api(_func):
    def wrapper(*args, **kwargs):
        query_dict = app.current_event.query_string_parameters or {}

        pay_load = (app.current_event.body and json.loads(
            app.current_event.body)) or {}
        pay_load = {**kwargs, **pay_load, **query_dict}

        return _func(pay_load)
    return wrapper


def bind(_func, _wrapper, _wrapper_arg):
    @_wrapper(_wrapper_arg)
    @api
    def wrapper(*args, **kwargs):
        return _func(*args, **kwargs)
    return wrapper


class PayloadEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return int(obj)
        return super(PayloadEncoder, self).default(obj)


class Response(BaseResponse):
    def __init__(self,
                 status_code: int,
                 content_type: Optional[str] = None,
                 body: Union[str, bytes, None, Dict] = None,
                 headers: Optional[Dict[str, Union[str, List[str]]]] = None,
                 cookies: Optional[List[Cookie]] = None):
        if isinstance(body, dict):
            body = json.dumps(body, cls=PayloadEncoder)
        if headers:
            headers = {**default_headers, **headers}
        else:
            headers = default_headers
        super().__init__(status_code, content_type, body, headers, cookies)
