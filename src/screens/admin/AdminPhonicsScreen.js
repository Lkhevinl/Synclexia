import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';

export default function AdminPhonicsScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
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
      .from(TABLES.PHONICS_ITEMS)
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
    if (!profile?.id) return Alert.alert('Error', 'User authentication required. Please log in again.');

    if (editingId) {
      const { error } = await supabase
        .from(TABLES.PHONICS_ITEMS)
        .update({ label: label.trim(), icon, bg_color: bgColor })
        .eq('id', editingId);

      if (error) return Alert.alert('Error', error.message);
      Alert.alert('Success', 'Item updated.');
    } else {
      const { error } = await supabase
        .from(TABLES.PHONICS_ITEMS)
        .insert([{ label: label.trim(), icon, bg_color: bgColor, created_by: profile.id }]);

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
            .from(TABLES.PHONICS_ITEMS)
            .delete()
            .eq('id', id);

          if (error) Alert.alert('Error', error.message);
          fetchItems();
        }
      }
    ]);
  };

  return (
    <ScreenWrapper role="admin" padded={false} style={{ backgroundColor: colors.surface }}>
      <View style={styles.headerRow}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Phonics Manager</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Label (e.g. ba, ch, sh)"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={styles.input}
          placeholder="Icon (Lucide name)"
          value={icon}
          onChangeText={setIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Background color (hex)"
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
        <ActivityIndicator size="large" color="#0288D1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Icon name={item.icon || 'mic'} size="md" color="#455A64" />
                <View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemMeta}>{item.bg_color}</Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                  <Icon name="pencil" size="md" color="#0288D1" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                  <Icon name="trash" size="md" color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No phonics items yet.</Text>}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 15 },

  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  formTitle: { fontWeight: 'bold', marginBottom: 10, color: '#0277BD' },
  input: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: '#0288D1', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#0288D1', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelText: { color: '#0288D1', fontWeight: 'bold' },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: { fontSize: 28 },
  itemLabel: { fontWeight: 'bold', color: '#333' },
  itemMeta: { fontSize: 11, color: '#777' },
  itemActions: { flexDirection: 'row' },
  iconBtn: { padding: 6 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 }
});
