// ...existing code from AdminPhonicsScreen.js...
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from '../../../components/icons/Icon';
import { supabase } from '../../../lib/supabase';
import GoBackBtn from '../../../components/GoBackBtn';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

export default function TeacherPhonicsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('mic');
  const [bgColor, setBgColor] = useState('#4FC3F7');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('phonics_items')
      .select('*')
      .order('label');
    if (error) Alert.alert('Error', error.message);
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setLabel('');
    setIcon('mic');
    setBgColor('#4FC3F7');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!label.trim()) return Alert.alert('Error', 'Label is required.');
    if (editingId) {
      const { error } = await supabase
        .from('phonics_items')
        .update({ label: label.trim(), icon, bg_color: bgColor })
        .eq('id', editingId);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Success', 'Item updated.');
    } else {
      const { error } = await supabase
        .from('phonics_items')
        .insert([{ label: label.trim(), icon, bg_color: bgColor }]);
      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Success', 'Item added.');
    }
    resetForm();
    fetchItems();
  };

  const handleEdit = (item) => {
    setLabel(item.label || '');
    setIcon(item.icon || 'mic');
    setBgColor(item.bg_color || '#4FC3F7');
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this item?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await supabase
            .from('phonics_items')
            .delete()
            .eq('id', id);
          if (error) Alert.alert('Error', error.message);
          fetchItems();
        }
      }
    ]);
  };

  const { colors } = useTheme();

  return (
    <ScreenWrapper role="teacher" scrollable>
      <View style={styles.headerRow}>
        <GoBackBtn />
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Phonics Manager</Text>
      </View>
      <View style={[styles.formCard, { backgroundColor: colors.surfaceCard }]}>
        <Text style={[styles.formTitle, { color: colors.primary }]}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          placeholder="Label (e.g. ba, ch, sh)"
          placeholderTextColor={colors.onSurfaceMuted}
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          placeholder="Icon (Lucide name)"
          placeholderTextColor={colors.onSurfaceMuted}
          value={icon}
          onChangeText={setIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          placeholder="Background color (hex)"
          placeholderTextColor={colors.onSurfaceMuted}
          value={bgColor}
          onChangeText={setBgColor}
          autoCapitalize="none"
        />
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>{editingId ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: tokens.spacing.lg }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: tokens.spacing.lg }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.itemRow, { backgroundColor: colors.surfaceCard }]}>
              <View style={styles.itemInfo}>
                <Icon name={item.icon || 'mic'} size="md" color={colors.onSurface} />
                <View>
                  <Text style={[styles.itemLabel, { color: colors.onSurface }]}>{item.label}</Text>
                  <Text style={[styles.itemMeta, { color: colors.onSurfaceMuted }]}>{item.bg_color}</Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                  <Icon name="pencil" size="md" color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                  <Icon name="trash" size="md" color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.onSurfaceMuted }]}>No phonics items yet.</Text>}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  formCard: { borderRadius: tokens.radius.md, padding: 15, marginBottom: 15, elevation: 2 },
  formTitle: { fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#fafafa', borderWidth: 1, borderRadius: tokens.radius.sm, padding: 10, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: '#0288D1', padding: tokens.spacing.md, borderRadius: tokens.radius.sm, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#0288D1', padding: tokens.spacing.md, borderRadius: tokens.radius.sm, alignItems: 'center' },
  cancelText: { color: '#0288D1', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.spacing.md, borderRadius: 10, marginBottom: tokens.spacing.sm, elevation: 1 },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: { fontSize: 28 },
  itemLabel: { fontWeight: 'bold' },
  itemMeta: { fontSize: 11 },
  itemActions: { flexDirection: 'row' },
  iconBtn: { padding: 6 },
  emptyText: { textAlign: 'center', marginTop: tokens.spacing.lg }
});