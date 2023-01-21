from .utils import app, bind
from ..apis import get_products, post_product, update_product, delete_product, get_records, post_record, update_record, delete_record
from ..auth import login

api_binding = True

def init():
    global api_binding
    if api_binding:
        binding()
        api_binding = False


def binding():
    bind(get_products, app.get, '/products')
    bind(post_product, app.post, '/products')
    bind(update_product, app.patch, '/products/<product_id>')
    bind(delete_product, app.delete, '/products/<product_id>')
    bind(get_records, app.get, '/products/<product_id>/records')
    bind(post_record, app.post, '/products/<product_id>/records')
    bind(update_record, app.patch, '/products/<product_id>/records/<record_id>')
    bind(delete_record, app.delete, '/products/<product_id>/records/<record_id>')
    bind(login, app.post, '/login')
