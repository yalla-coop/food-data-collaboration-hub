import { useNavigate } from "@shopify/app-bridge-react";
import {useCallback, useEffect, useState} from 'react';
import {
  Card,
  Checkbox,
  IndexTable,
  Stack,
  TextStyle,
  Thumbnail,
  UnstyledLink,
} from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

/* useMedia is used to support multiple screen sizes */
//import { useMedia } from "@shopify/react-hooks";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
  id,
  title,
  product,
  discountCode,
  scans,
  navigate,
}) {
  return (
    <UnstyledLink onClick={() => navigate(`/products/${id}`)}>
      <div
        style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}
      >
        <Stack>
          <Stack.Item>
            <Thumbnail
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </Stack.Item>
          <Stack.Item fill>
            <Stack vertical={true}>
              <Stack.Item>
                <p>
                  <TextStyle variation="strong">
                    {truncate(title, 35)}
                  </TextStyle>
                </p>
                <p>{truncate(product?.title, 35)}</p>
              </Stack.Item>
              <div style={{ display: "flex" }}>
                <div style={{ flex: "3" }}>
                  <TextStyle variation="subdued">Discount</TextStyle>
                  <p>{discountCode || "-"}</p>
                </div>
                <div style={{ flex: "2" }}>
                  <TextStyle variation="subdued">Scans</TextStyle>
                  <p>{scans}</p>
                </div>
              </div>
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </UnstyledLink>
  );
}

function ProductsList({ FDCProducts, ShopifyProducts, loading }) {
  const authenticatedFetch = useAuthenticatedFetch();

  const navigate = useNavigate();

  console.log('ProductsList shopifyProducts', ShopifyProducts)

  const [shopifyProducts, setShopifyProducts] = useState(ShopifyProducts || []);

  useEffect(() => {
    setShopifyProducts(ShopifyProducts || []);
  }, [ShopifyProducts]);

  console.log('shopifyProducts', shopifyProducts)
  /* Check if screen is small */
  //const isSmallScreen = useMedia("(max-width: 640px)");
  const isSmallScreen = false

  /* Map over Products for small screen */
  const smallScreenMarkup = FDCProducts.map((Product) => (
    <SmallScreenCard key={Product.id} navigate={navigate} {...Product} />
  ));

  const resourceName = {
    singular: "Product",
    plural: "Products",
  };

  const rowMarkup = FDCProducts.map(
    (fdcProduct, index) => {

      let id = fdcProduct['@id'];
      let title = fdcProduct['dfc-b:description'] || "";
      let price = fdcProduct['price'] || "";

      let shopifyProduct = shopifyProducts.find(
        (shopifyProduct) => {
          const fdcMetafield = shopifyProduct?.metafields?.edges?.find((metafield) => {
            return metafield.node.key == 'fdcId'
          })
          console.log('fdcMetafield?.node?.value', fdcMetafield?.node?.value, 'fdcProduct ', fdcProduct['@id'] )
          return fdcMetafield?.node?.value === fdcProduct['@id']
        }
      );

      console.log('shopifyProduct is', shopifyProduct)

      const [isCreating, setIsCreating] = useState(false);
      const createShopifyProduct = useCallback(async () => {
        setIsCreating(true);
        const response = await authenticatedFetch(`/api/products/shopify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fdcId: fdcProduct['@id'],
            title: fdcProduct['dfc-b:description'],
            price: fdcProduct['price'],
          }),
        });
        if (response.ok) {
          const body = await response.json();
          if (body.userErrors.length > 0) {
            console.warn("Couldn't create Shopify product", body.userErrors[0]);
          } else {
            setShopifyProducts((shopifyProducts) => [
              ...shopifyProducts,
              body.product,
            ]);
          }
          setIsCreating(false);
        }
      }, []);

      const [isDeleting, setIsDeleting] = useState(false);
      const deleteShopifyProduct = useCallback(async () => {
        setIsDeleting(true);
        const response = await authenticatedFetch(`/api/products/shopify/${shopifyProduct.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setShopifyProducts((shopifyProducts) =>
            shopifyProducts.filter((shopifyProduct) => shopifyProduct.id !== id)
          );
          setIsDeleting(false);
        }
      }, []);

      const handleToggleShopifyListing = useCallback(
        (newChecked) => {
          console.log('handleListToShopify', newChecked)
          if (newChecked) {
            createShopifyProduct();
          } else {
            deleteShopifyProduct();
          }
        }
      )

      /* The form layout, created using Polaris components */
      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
        >
          <IndexTable.Cell>
            {truncate(title, 25)}
          </IndexTable.Cell>
          <IndexTable.Cell>
            £{price}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Checkbox
              checked={!!shopifyProduct}
              onChange={handleToggleShopifyListing}
              disabled={isCreating || isDeleting}
            />
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>
      {isSmallScreen ? (
        smallScreenMarkup
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={FDCProducts.length}
          headings={[
            { title: "Title" },
            { title: "Date created" },
            { title: "List on my store" },
          ]}
          selectable={false}
          loading={loading}
        >
          {rowMarkup}
        </IndexTable>
      )}
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}

export { ProductsList }