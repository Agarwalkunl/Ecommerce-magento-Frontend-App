import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { API_CONFIG } from '../config/api.config';

export const apolloClient = new ApolloClient({
  uri: API_CONFIG.GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  headers: API_CONFIG.HEADERS,
});

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
        total_count
        items {
            name
            products {
                total_count
                items {
                    uid
                    id
                    name
                    sku
                    type_id
                    url_key
                    url_suffix
                    stock_status
                    image {
                        url
                        label
                    }
                    price_range {
                        minimum_price {
                            regular_price {
                                value
                                currency
                            }
                        }
                    }
                    categories {
                        name
                        product_count
                        id
                        level
                    }
                }
            }
        }
    }
}
`;

export const GET_PRODUCT_DETAIL = gql`
  query ProductDetail($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        id
        uid
        name
        sku
        type_id
        description {
          html
        }
        stock_status
        url_key
        url_suffix
        image {
          url
          label
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
          }
        }
        categories {
          id
          name
        }
        ... on ConfigurableProduct {
          configurable_options {
            id
            attribute_code
            label
            values {
              value_index
              label
            }
          }
          variants {
            product {
              id
              name
              sku
              stock_status
              image {
                url
                label
              }
              price_range {
                minimum_price {
                  regular_price {
                    value
                    currency
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
