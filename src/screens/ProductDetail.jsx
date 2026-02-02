import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_DETAIL } from '../services/graphql.service';
import { API_CONFIG } from '../config/api.config';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route }) => {
  const { sku } = route.params;
  const { loading, error, data } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { sku },
  });

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Product Details...</Text>
      </View>
    );
  }

  if (error || !data?.products?.items?.[0]) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorMessage}>{error?.message || 'Unable to load product details'}</Text>
      </View>
    );
  }

  const product = data.products.items[0];
  
  // Get current product (variant or main product)
  const currentProduct = selectedVariantIndex !== null 
    ? product.variants[selectedVariantIndex].product 
    : product;

  // Process image URL
  let imageUrl = currentProduct.image?.url || '';
  if (imageUrl) {
    imageUrl = imageUrl.replace(/\\/g, '/');
    imageUrl = imageUrl.replace('http://rocking.magento.com', API_CONFIG.IMAGE_BASE_URL);
  }
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_CONFIG.IMAGE_BASE_URL}${imageUrl}`;

  // Handle option selection (e.g., color)
  const handleOptionSelect = (attributeCode, valueIndex, label) => {
    setSelectedOptions({ ...selectedOptions, [attributeCode]: { valueIndex, label } });
    
    // Find matching variant
    if (product.variants) {
      const variantIndex = product.variants.findIndex(variant => 
        variant.product.name.toLowerCase().includes(label.toLowerCase())
      );
      if (variantIndex !== -1) {
        setSelectedVariantIndex(variantIndex);
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: fullImageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {currentProduct.stock_status === 'IN_STOCK' ? (
          <View style={styles.stockBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.stockBadgeText}>In Stock</Text>
          </View>
        ) : (
          <View style={[styles.stockBadge, styles.outOfStockBadge]}>
            <Ionicons name="close-circle" size={16} color="#fff" />
            <Text style={styles.stockBadgeText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {product.categories.map((cat, index) => (
              <View key={cat.id} style={styles.categoryPill}>
                <Ionicons name="pricetag" size={12} color="#667eea" />
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Name */}
        <Text style={styles.productName}>{product.name}</Text>
        
        {/* SKU */}
        <Text style={styles.sku}>SKU: {currentProduct.sku}</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>
            {currentProduct.price_range?.minimum_price?.regular_price?.currency}
          </Text>
          <Text style={styles.price}>
            ${currentProduct.price_range?.minimum_price?.regular_price?.value}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Configurable Options (e.g., Color) */}
        {product.configurable_options && product.configurable_options.length > 0 && (
          <View style={styles.optionsContainer}>
            {product.configurable_options.map((option) => (
              <View key={option.id} style={styles.optionSection}>
                <Text style={styles.optionLabel}>
                  {option.label}
                  {selectedOptions[option.attribute_code] && (
                    <Text style={styles.selectedOptionValue}>
                      : {selectedOptions[option.attribute_code].label}
                    </Text>
                  )}
                </Text>
                
                <View style={styles.optionValuesRow}>
                  {option.values.map((value) => {
                    const isSelected = selectedOptions[option.attribute_code]?.valueIndex === value.value_index;
                    return (
                      <TouchableOpacity
                        key={value.value_index}
                        style={[styles.optionButton, isSelected && styles.optionButtonActive]}
                        onPress={() => handleOptionSelect(option.attribute_code, value.value_index, value.label)}
                      >
                        <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextActive]}>
                          {value.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        {product.description?.html && product.description.html.trim() !== '' && (
          <>
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={18} color="#333" /> Description
              </Text>
              <Text style={styles.descriptionText}>
                {product.description.html.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Product Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={18} color="#333" /> Product Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Product Type:</Text>
            <Text style={styles.infoValue}>{product.type_id === 'configurable' ? 'Configurable' : 'Simple'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock Status:</Text>
            <Text style={[styles.infoValue, { color: product.stock_status === 'IN_STOCK' ? '#10b981' : '#ef4444' }]}>
              {product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>

      {/* Add to Cart Button (Fixed at bottom in future) */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.addToCartButton, currentProduct.stock_status !== 'IN_STOCK' && styles.addToCartButtonDisabled]}
          disabled={currentProduct.stock_status !== 'IN_STOCK'}
        >
          <Ionicons name="cart" size={24} color="#fff" />
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff6b6b',
    marginTop: 16,
    marginBottom: 1,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: width                ,
    backgroundColor: '#fff',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  outOfStockBadge: {
    backgroundColor: '#ef4444',
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 1,
    lineHeight: 34,
  },
  sku: {
    fontSize: 13,
    color: '#999',
    marginBottom: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginRight: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#667eea',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  optionsContainer: {
    marginBottom: 1,
  },
  optionSection: {
    marginBottom: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 1,
  },
  selectedOptionValue: {
    color: '#667eea',
    fontWeight: '700',
  },
  optionValuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  optionButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#5568d3',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 2,
  },
  descriptionSection: {
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  infoSection: {
    marginBottom: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
