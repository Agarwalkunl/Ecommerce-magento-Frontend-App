import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { API_CONFIG } from '../config/api.config';

const { width } = Dimensions.get('window');

export const ProductCard = ({ product }) => {
  let imageUrl = product?.image?.url || product?.swatch_image || '';
  
  if (imageUrl) {
    imageUrl = imageUrl.replace(/\\/g, '/');
    imageUrl = imageUrl.replace('http://rocking.magento.com', API_CONFIG.IMAGE_BASE_URL);
  }
  
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${API_CONFIG.IMAGE_BASE_URL}${imageUrl}`;
  
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: fullImageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.sku}>{product.sku}</Text>
        
        {product.price?.maximalPrice?.amount && (
          <Text style={styles.price}>
            {product.price.maximalPrice.amount.currency} ${product.price.maximalPrice.amount.value}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={[styles.stockBadge, product.stock_status === 'IN_STOCK' ? styles.inStock : styles.outStock]}>
            <Text style={styles.stockText}>
              {product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
    height: 36,
  },
  sku: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inStock: {
    backgroundColor: '#d4edda',
  },
  outStock: {
    backgroundColor: '#f8d7da',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#155724',
  },
});
