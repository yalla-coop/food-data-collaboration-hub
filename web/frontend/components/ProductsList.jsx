import { useNavigate } from "@shopify/app-bridge-react";
import {useCallback} from 'react';
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

/* useMedia is used to support multiple screen sizes */
//import { useMedia } from "@shopify/react-hooks";

/* dayjs is used to capture and format the date a QR code was created or modified */
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
  id,
  title,
  product,
  discountCode,
  scans,
  createdAt,
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
                <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
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
  const navigate = useNavigate();

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

  console.log('ProductsList')

  const rowMarkup = FDCProducts.map(
    (fdcProduct, index) => {
    //({ id, title, product, discountCode, scans, createdAt }, index) => {
      //let shopifyProduct = ShopifyProducts.find(
      //  (shopifyProduct) => shopifyProduct.id === fdcProduct.shopifyProductId
      //);
      let shopifyProduct = {};

      let id = fdcProduct['@id'];
      let title = fdcProduct.title || "Title";
      let createdAt = fdcProduct.createdAt || "2020-01-01T00:00:00.000Z";

      const handleToggleShopifyListing = useCallback(
        (newChecked) => console.log('handleListToShopify', newChecked),
        [],
      )

      /* The form layout, created using Polaris components */
      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
          onClick={() => {
            navigate(`/products/${id}`);
          }}
        >
          <IndexTable.Cell>
            {truncate(title, 25)}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {dayjs(createdAt).format("MMMM D, YYYY")}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Checkbox
              checked={!!shopifyProduct}
              onChange={handleToggleShopifyListing}
              disabled={false}
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