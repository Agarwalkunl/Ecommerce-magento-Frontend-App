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
            id
            uid
            name
            url_path
            url_key
            description
            image
            level
            product_count
            products {
                total_count
                items {
                    attribute_set_id
                    canonical_url
                    created_at
                    gift_message_available
                    id
                    name
                    rating_summary
                    review_count
                    sku
                    special_from_date
                    special_price
                    special_to_date
                    stock_status
                    swatch_image
                    tier_price
                    type_id
                    uid
                    updated_at
                    url_key
                    url_path
                    url_suffix
                    description {
                        html
                    }
                    short_description {
                        html
                    }
                    meta_title
                    meta_keyword
                    meta_description
                    image {
                        url
                        label
                        position
                        disabled
                    }
                    small_image {
                        url
                        label
                        position
                        disabled
                    }
                    thumbnail {
                        url
                        label
                        position
                        disabled
                    }
                    media_gallery {
                        url
                        label
                        position
                        disabled
                    }
                    color
                    country_of_manufacture
                    manufacturer
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
                            }
                        }
                        minimalPrice {
                            amount {
                                currency
                                value
                            }
                        }
                        maximalPrice {
                            amount {
                                currency
                                value
                            }
                        }
                    }
                    price_range {
                        minimum_price {
                            regular_price {
                                value
                                currency
                            }
                            final_price {
                                value
                                currency
                            }
                            discount {
                                amount_off
                                percent_off
                            }
                        }
                        maximum_price {
                            regular_price {
                                value
                                currency
                            }
                            final_price {
                                value
                                currency
                            }
                            discount {
                                amount_off
                                percent_off
                            }
                        }
                    }
                    categories {
                        id
                        uid
                        name
                        url_path
                        level
                    }
                }
            }
            children {
                id
                uid
                name
                url_path
                url_key
                available_sort_by
                children_count
                created_at
                product_count
                level
                breadcrumbs {
                    category_id
                    category_name
                    category_level
                    category_url_key
                }
            }
        }
    }
}
`;

