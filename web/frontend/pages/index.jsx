import {
  Button,
  Card,
  EmptyState,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  SkeletonBodyText
} from "@shopify/polaris";
import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";

import { useAppQuery } from "../hooks";
//import { trophyImage } from "../assets";
import { connector } from '../../connector/index.js'

import { ProductsCard } from "../components/ProductsCard.jsx";
import { ProductsList } from "../components/ProductsList.jsx";
import { useEffect } from "react";

export default function HomePage() {


  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
    const navigate = useNavigate();

    /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
    let {
      data: FDCProductsResponse,
      fdcIsLoading,
  
      /*
        react-query provides stale-while-revalidate caching.
        By passing isRefetching to Index Tables we can show stale data and a loading state.
        Once the query refetches, IndexTable updates and the loading state is removed.
        This ensures a performant UX.
      */
      fdcIsRefetching,
    } = useAppQuery({
      url: "/api/products/fdc",
    });

    console.log('FDCProductsResponse is', FDCProductsResponse)

    const FDCProducts = FDCProductsResponse && FDCProductsResponse[0]['@graph']

    //useEffect(async () => {
    //  FDCProducts = FDCProducts && await connector.import(FDCProducts)
    //}, [FDCProducts]);

    //console.log('FDCProducts 2 is', FDCProducts)
    //const importedCatalog = imported[0];
    const {
      data: ShopifyProducts,
      shopifyIsLoading,
  
      /*
        react-query provides stale-while-revalidate caching.
        By passing isRefetching to Index Tables we can show stale data and a loading state.
        Once the query refetches, IndexTable updates and the loading state is removed.
        This ensures a performant UX.
      */
      shopifyIsRefetching,
    } = useAppQuery({
      url: "/api/products/shopify",
    });
    console.log('Shopify data is', ShopifyProducts)

    /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
    const loadingMarkup = fdcIsLoading || shopifyIsLoading ? (
      <Card sectioned>
        <Loading />
        <SkeletonBodyText />
      </Card>
    ) : null;

    const isRefetching = fdcIsRefetching || shopifyIsRefetching;
  
    /* Set the Products to use in the list */
    const productsMarkup = FDCProducts?.length ? (
      <ProductsList FDCProducts={FDCProducts} ShopifyProducts={ShopifyProducts} loading={isRefetching} />
    ) : null;
    console.log('productsMarkup ', productsMarkup )
  
    /* Use Polaris Card and EmptyState components to define the contents of the empty state */
    /*
    const emptyStateMarkup =
      //!isLoading && !Products?.length ? (
      !isLoading ? (
        <Card sectioned>
          <EmptyState
            heading="Create unique QR codes for your product"
            action={{
              content: "Create QR code",
              onAction: () => navigate("/qrcodes/new"),
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Allow customers to scan codes and buy products using their phones.
            </p>
          </EmptyState>
        </Card>
      ) : null;
    */
  
    /*
      Use Polaris Page and TitleBar components to create the page layout,
      and include the empty state contents set above.
    */
    return (
      <Page fullWidth={!!productsMarkup}>
        <TitleBar
          title="Products"
        />
        <Layout>
          <Layout.Section>
            {loadingMarkup}
            {productsMarkup}
          </Layout.Section>
        </Layout>
      </Page>
    );
    //{emptyStateMarkup}



  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>Nice work on building a Shopify app 🎉</Heading>
                  <p>
                    Your app is ready to explore! It contains everything you
                    need to get started including the{" "}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{" "}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{" "}
                    <Link
                      url="https://shopify.dev/apps/tools/app-bridge"
                      external
                    >
                      App Bridge
                    </Link>{" "}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.{" "}
                  </p>
                  <p>
                    Learn more about building out your app in{" "}
                    <Link
                      url="https://shopify.dev/apps/getting-started/add-functionality"
                      external
                    >
                      this Shopify tutorial
                    </Link>{" "}
                    📚{" "}
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsList />
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
