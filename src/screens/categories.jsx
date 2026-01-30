import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../services/graphql.service';
import { ProductCard } from '../components/ProductCard';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export const CategoriesScreen = () => {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories = data?.categories?.items[0]?.children || [];
  const products = data?.categories?.items[0]?.products?.items || [];
  
  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'all' || p.stock_status === stockFilter;
    
    // Category filter - check if product belongs to selected category
    const matchesCategory = !selectedCategory || 
                           (p.categories && p.categories.some(cat => cat.name === selectedCategory));
    
    return matchesSearch && matchesStock && matchesCategory;
  });

  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      (a.price?.maximalPrice?.amount?.value || 0) - (b.price?.maximalPrice?.amount?.value || 0)
    );
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      (b.price?.maximalPrice?.amount?.value || 0) - (a.price?.maximalPrice?.amount?.value || 0)
    );
  } else if (sortBy === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  } else {
    filteredProducts = [...filteredProducts].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }


  const renderCategoryTab = ({ item }) => {
    const isSelected = selectedCategory === item.name;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
        onPress={() => setSelectedCategory(isSelected ? null : item.name)}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
          {item.name}
        </Text>
        <View style={[styles.productCountBadge, isSelected && styles.productCountBadgeActive]}>
          <Text style={[styles.productCountText, isSelected && styles.productCountTextActive]}>
            {item.product_count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Products</Text>
        <Text style={styles.headerSubtitle}>{filteredProducts.length} of {products.length} items</Text>
      </View>

      {/* Search Bar with Icons */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sorting</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Sort By Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'name' && styles.filterOptionActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Ionicons name="text" size={20} color={sortBy === 'name' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'name' && styles.filterOptionTextActive]}>
                    Name (A-Z)
                  </Text>
                  {sortBy === 'name' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'price-low' && styles.filterOptionActive]}
                  onPress={() => setSortBy('price-low')}
                >
                  <Ionicons name="arrow-down" size={20} color={sortBy === 'price-low' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'price-low' && styles.filterOptionTextActive]}>
                    Price: Low to High
                  </Text>
                  {sortBy === 'price-low' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'price-high' && styles.filterOptionActive]}
                  onPress={() => setSortBy('price-high')}
                >
                  <Ionicons name="arrow-up" size={20} color={sortBy === 'price-high' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'price-high' && styles.filterOptionTextActive]}>
                    Price: High to Low
                  </Text>
                  {sortBy === 'price-high' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, sortBy === 'newest' && styles.filterOptionActive]}
                  onPress={() => setSortBy('newest')}
                >
                  <Ionicons name="time" size={20} color={sortBy === 'newest' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, sortBy === 'newest' && styles.filterOptionTextActive]}>
                    Newest First
                  </Text>
                  {sortBy === 'newest' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>
              </View>

              {/* Stock Status Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Availability</Text>
                <TouchableOpacity
                  style={[styles.filterOption, stockFilter === 'all' && styles.filterOptionActive]}
                  onPress={() => setStockFilter('all')}
                >
                  <Ionicons name="apps" size={20} color={stockFilter === 'all' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, stockFilter === 'all' && styles.filterOptionTextActive]}>
                    All Products
                  </Text>
                  {stockFilter === 'all' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterOption, stockFilter === 'IN_STOCK' && styles.filterOptionActive]}
                  onPress={() => setStockFilter('IN_STOCK')}
                >
                  <Ionicons name="checkmark-circle" size={20} color={stockFilter === 'IN_STOCK' ? '#667eea' : '#666'} />
                  <Text style={[styles.filterOptionText, stockFilter === 'IN_STOCK' && styles.filterOptionTextActive]}>
                    In Stock Only
                  </Text>
                  {stockFilter === 'IN_STOCK' && <Ionicons name="checkmark" size={20} color="#667eea" />}
                </TouchableOpacity>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderCategoryTab}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  filterSection: {
    marginVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryTabActive: {
    backgroundColor: '#667eea',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  productCountBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  productCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  productCountTextActive: {
    color: '#ffffff',
  },
  productsContainer: {
    padding: 20,
  },
  productRow: {
    justifyContent: 'space-between',
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
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
