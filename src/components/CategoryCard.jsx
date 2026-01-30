import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CategoryCard = ({ category, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress && onPress(category)}
      activeOpacity={0.8}
    >
      <View style={styles.gradientOverlay} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{category.product_count}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Products</Text>
            <Text style={styles.detailValue}>{category.product_count}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Sub-categories</Text>
            <Text style={styles.detailValue}>{category.children_count}</Text>
          </View>
        </View>

        <Text style={styles.date}>Added {formatDate(category.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  date: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

