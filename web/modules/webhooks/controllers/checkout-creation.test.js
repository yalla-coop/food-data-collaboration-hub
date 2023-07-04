import { beforeAll, expect, test } from "vitest";

const secretKey = '6f9342f916e63bff20e5a7722dbc0ad6a5ee9a476e339bd685714d58c1ce5af4'

const body = `{"id":981820079255243500,"token":"123123123","cart_token":"eeafa272cebfd4b22385bc4b645e762c","email":"example@email.com
","gateway":null,"buyer_accepts_marketing":false,"created_at":"2023-06-28T14:56:42-04:00","updated_at":"2023-06-28T14:56:42-04:0
0","landing_site":null,"note":null,"note_attributes":[],"referring_site":null,"shipping_lines":[],"taxes_included":true,"total_w
eight":400,"currency":"GBP","completed_at":null,"closed_at":null,"user_id":null,"location_id":null,"source_identifier":null,"sou
rce_url":null,"device_id":null,"phone":null,"customer_locale":null,"line_items":[{"applied_discounts":[],"discount_allocations":
[],"key":"79f568613422e052d598a9534159632b","destination_location_id":3780341104913,"fulfillment_service":"manual","gift_card":f
alse,"grams":200,"origin_location_id":3780341072145,"presentment_title":"Aviator 
sunglasses","presentment_variant_title":"","product_id":788032119674292900,"properties":null,"quantity":1,"requires_shipping":tr
ue,"sku":"SKU2006-001","tax_lines":[],"taxable":true,"title":"Aviator 
sunglasses","variant_id":642667041472714000,"variant_title":"","variant_price":"19.99","vendor":null,"user_id":null,"unit_price_
measurement":{"measured_type":null,"quantity_value":null,"quantity_unit":null,"reference_value":null,"reference_unit":null},"ran
k":null,"compare_at_price":"24.99","line_price":"89.99","price":"89.99"},{"applied_discounts":[],"discount_allocations":[],"key"
:"af8476a4dafd2a477e2882cff5bd595f","destination_location_id":3780341104913,"fulfillment_service":"manual","gift_card":false,"gr
ams":200,"origin_location_id":3780341072145,"presentment_title":"Mid-century 
lounger","presentment_variant_title":"","product_id":788032119674292900,"properties":null,"quantity":1,"requires_shipping":true,
"sku":"SKU2006-020","tax_lines":[],"taxable":true,"title":"Mid-century 
lounger","variant_id":757650484644203900,"variant_title":"","variant_price":"19.99","vendor":null,"user_id":null,"unit_price_mea
surement":{"measured_type":null,"quantity_value":null,"quantity_unit":null,"reference_value":null,"reference_unit":null},"rank":
null,"compare_at_price":"24.99","line_price":"159.99","price":"159.99"}],"name":"#981820079255243537","source":null,"abandoned_c
heckout_url":"https://checkout.shopify.com/71606010129/checkouts/123123123/recover?key=example-secret-token","discount_codes":[]
,"tax_lines":[],"source_name":"web","presentment_currency":"GBP","buyer_accepts_sms_marketing":false,"sms_marketing_phone":null,
"total_discounts":"0.00","total_line_items_price":"249.98","total_price":"249.98","total_tax":"0.00","subtotal_price":"249.98","
total_duties":null,"billing_address":{"first_name":"Bob","address1":"123 Billing 
Street","phone":"555-555-BILL","city":"Billtown","zip":"K2P0B0","province":"Kentucky","country":"United 
States","last_name":"Biller","address2":null,"company":"My Company","latitude":null,"longitude":null,"name":"Bob 
Biller","country_code":"US","province_code":"KY"},"shipping_address":{"first_name":"Steve","address1":"123 Shipping 
Street","phone":"555-555-SHIP","city":"Shippington","zip":"K2P0S0","province":"Kentucky","country":"United 
States","last_name":"Shipper","address2":null,"company":"Shipping Company","latitude":null,"longitude":null,"name":"Steve 
Shipper","country_code":"US","province_code":"KY"},"customer":{"id":603851970716743400,"email":"john@example.com","accepts_marke
ting":false,"created_at":null,"updated_at":null,"first_name":"John","last_name":"Smith","orders_count":0,"state":"disabled","tot
al_spent":"0.00","last_order_id":null,"note":null,"verified_email":true,"multipass_identifier":null,"tax_exempt":false,"tags":""
,"last_order_name":null,"currency":"GBP","phone":null,"accepts_marketing_updated_at":null,"marketing_opt_in_level":null,"tax_exe
mptions":[],"email_marketing_consent":{"state":"not_subscribed","opt_in_level":null,"consent_updated_at":null},"sms_marketing_co
nsent":null,"admin_graphql_api_id":"gid://shopify/Customer/603851970716743426","default_address":{"id":null,"customer_id":603851
970716743400,"first_name":null,"last_name":null,"company":null,"address1":"123 Elm 
St.","address2":null,"city":"Ottawa","province":"Ontario","country":"Canada","zip":"K2H7A8","phone":"123-123-1234","name":"","pr
ovince_code":"ON","country_code":"CA","country_name":"Canada","default":true}}}`

test('verify ', async () => {
  expect(true).toBe(true);
});