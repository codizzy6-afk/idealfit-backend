import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// API endpoint to fetch Shopify products
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search");
    const productType = url.searchParams.get("product_type");
    const vendor = url.searchParams.get("vendor");

    // Build GraphQL query
    let query = `
      query getProducts($first: Int!) {
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              vendor
              createdAt
              updatedAt
              status
              totalInventory
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    weight
                    weightUnit
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              options {
                id
                name
                values
              }
              tags
              seo {
                title
                description
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    // Add filters if provided
    if (search || productType || vendor) {
      query = `
        query getProducts($first: Int!, $query: String) {
          products(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                productType
                vendor
                createdAt
                updatedAt
                status
                totalInventory
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      compareAtPrice
                      inventoryQuantity
                      weight
                      weightUnit
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
                options {
                  id
                  name
                  values
                }
                tags
                seo {
                  title
                  description
                }
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      `;
    }

    // Build query string for filters
    let queryString = "";
    if (search) queryString += `title:*${search}* `;
    if (productType) queryString += `product_type:${productType} `;
    if (vendor) queryString += `vendor:${vendor} `;

    const variables: any = { first: limit };
    if (queryString) variables.query = queryString.trim();

    const response = await admin.graphql(query, { variables });
    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("Failed to fetch products from Shopify");
    }

    // Transform Shopify data to our format
    const products = data.data.products.edges.map((edge: any) => {
      const product = edge.node;
      
      return {
        id: product.id.replace('gid://shopify/Product/', ''),
        title: product.title,
        handle: product.handle,
        description: product.description,
        productType: product.productType,
        vendor: product.vendor,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        status: product.status,
        totalInventory: product.totalInventory,
        variants: product.variants.edges.map((variantEdge: any) => {
          const variant = variantEdge.node;
          return {
            id: variant.id.replace('gid://shopify/ProductVariant/', ''),
            title: variant.title,
            sku: variant.sku,
            price: parseFloat(variant.price),
            compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
            inventoryQuantity: variant.inventoryQuantity,
            weight: variant.weight,
            weightUnit: variant.weightUnit,
            availableForSale: variant.availableForSale,
            selectedOptions: variant.selectedOptions.map((option: any) => ({
              name: option.name,
              value: option.value
            })),
            image: variant.image ? {
              url: variant.image.url,
              altText: variant.image.altText
            } : null
          };
        }),
        images: product.images.edges.map((imageEdge: any) => {
          const image = imageEdge.node;
          return {
            id: image.id.replace('gid://shopify/MediaImage/', ''),
            url: image.url,
            altText: image.altText,
            width: image.width,
            height: image.height
          };
        }),
        options: product.options.map((option: any) => ({
          id: option.id.replace('gid://shopify/ProductOption/', ''),
          name: option.name,
          values: option.values
        })),
        tags: product.tags,
        seo: product.seo ? {
          title: product.seo.title,
          description: product.seo.description
        } : null
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: products,
      pagination: data.data.products.pageInfo,
      total: products.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: []
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
