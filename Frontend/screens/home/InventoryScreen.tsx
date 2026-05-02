import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';
import { getPermissions, type UserRole } from '../../constants/roles';

interface InventoryItem {
  id: number;
  project_id: number;
  item_name: string;
  category: string;
  quantity: number | string;
  critical_level: number | string;
  price: number | string;
  unit?: string;
}

interface InventoryLog {
  id: number;
  item_id: number;
  action_type: string;
  quantity: number | string;
  notes?: string | null;
  created_at: string;
  item_name: string;
  unit?: string | null;
  project_name?: string | null;
  location?: string | null;
  actor_name?: string | null;
}

interface Props {
  projectId: number;
  userId: number;
  onBack: () => void;
  userRole?: UserRole;
}

function stockStatus(qty: number | string, critical: number | string): { label: string; bg: string } {
  const q = Number(qty) || 0;
  const c = Number(critical) || 0;
  if (q <= 0) return { label: 'Out of Stock', bg: '#FF6B6B' };
  if (q <= c) return { label: 'Low Stock', bg: '#FF9F43' };
  return { label: 'In Stock', bg: '#5DBF50' };
}

const PREDEFINED_ITEMS: Record<string, string> = {
  Cement: 'Materials',
  'Extension Wire': 'Tools',
  'Glass Panels': 'Materials',
  'Welding Machine': 'Equipment',
};

const ACTION_LABELS: Record<string, string> = {
  add_item: 'Added',
  update_stock: 'Stock Updated',
  delete_item: 'Deleted',
  consume: 'Consumed',
  return: 'Returned',
  correction: 'Corrected',
};

export default function InventoryScreen({ projectId, userId, onBack, userRole }: Props) {
  const perms = getPermissions(userRole);
  const canEdit = perms.canEditInventory;
  const canAdd = perms.canAddInventory;

  const [activeTab, setActiveTab] = useState<'items' | 'logs'>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all');

  const [showAdd, setShowAdd] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Materials');
  const [addQty, setAddQty] = useState('');
  const [addCritical, setAddCritical] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addUnit, setAddUnit] = useState('pcs');
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [showAddLog, setShowAddLog] = useState(false);
  const [logItemId, setLogItemId] = useState('');
  const [logActionType, setLogActionType] = useState('correction');
  const [logQty, setLogQty] = useState('');
  const [logNotes, setLogNotes] = useState('');

  const categories = ['All', 'Materials', 'Equipment', 'Tools'];
  const actionTypes = ['all', 'add_item', 'update_stock', 'delete_item', 'consume', 'return', 'correction'];

  const fetchItems = async () => {
    const response = await fetch(`${API_URL}/inventory?projectId=${projectId}`);
    if (!response.ok) throw new Error('Failed to load inventory items.');
    return response.json();
  };

  const fetchLogs = async () => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      search: search.trim(),
      actionType: selectedAction,
    });
    const response = await fetch(`${API_URL}/inventory/logs?${q.toString()}`);
    if (!response.ok) throw new Error('Failed to load inventory logs.');
    return response.json();
  };

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const [itemsData, logsData] = await Promise.all([fetchItems(), fetchLogs()]);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err: any) {
      setError(err?.message || 'Could not load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId, selectedAction]);

  const handleAdd = async () => {
    if (!addName.trim()) return Alert.alert('Required', 'Item name is required.');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          itemName: addName,
          category: addCategory,
          quantity: addQty,
          criticalLevel: addCritical,
          price: addPrice,
          unit: addUnit,
          createdBy: userId,
        }),
      });
      if (!res.ok) throw new Error('Unable to add inventory item.');
      Alert.alert('Success', 'Inventory item added.');
      setShowAdd(false);
      setAddName('');
      setAddQty('');
      setAddCritical('');
      setAddPrice('');
      await load();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/inventory/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: editName,
          quantity: editQty,
          updatedBy: userId,
          notes: 'Stock updated from mobile app.',
        }),
      });
      if (!res.ok) throw new Error('Unable to update item.');
      Alert.alert('Success', 'Inventory item updated.');
      setEditItem(null);
      await load();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Item', 'Delete this inventory item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/inventory/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deletedBy: userId }),
            });
            if (!res.ok) throw new Error('Delete failed.');
            Alert.alert('Success', 'Inventory item deleted.');
            await load();
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete item.');
          }
        },
      },
    ]);
  };

  const handleAddLog = async () => {
    if (!logItemId || !logQty) {
      return Alert.alert('Required', 'Please select item and quantity.');
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/inventory/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: Number(logItemId),
          actionType: logActionType,
          quantity: Number(logQty),
          notes: logNotes || null,
          createdBy: userId,
        }),
      });
      if (!res.ok) throw new Error('Unable to create log entry.');
      Alert.alert('Success', 'Inventory log added.');
      setShowAddLog(false);
      setLogItemId('');
      setLogQty('');
      setLogNotes('');
      await load();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create log.');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      items
        .filter((i) => selectedCategory === 'All' || i.category === selectedCategory)
        .filter((i) => i.item_name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => Number(b.id) - Number(a.id)),
    [items, selectedCategory, search]
  );

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return logs.filter((l) => {
      if (!search.trim()) return true;
      return l.item_name?.toLowerCase().includes(search.toLowerCase());
    }).filter((l) => {
      if (dateRange === 'all') return true;
      const createdAt = new Date(l.created_at).getTime();
      const threshold = dateRange === '7d' ? now - 7 * dayMs : now - 30 * dayMs;
      return createdAt >= threshold;
    });
  }, [logs, search, dateRange]);

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#E7E7EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 10,
  } as const;

  return (
    <View className="flex-1 bg-[#F8F8FA]">
      <View className="flex-row items-center px-5 pb-3 pt-12">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-[26px] font-bold text-[#7370FF]">Inventory</Text>
      </View>

      <View className="px-5 pb-3">
        <View className="mb-3 flex-row rounded-full border border-[#EEE] bg-white p-1">
          <TouchableOpacity
            className={`flex-1 rounded-full py-2 ${activeTab === 'items' ? 'bg-[#7370FF]' : ''}`}
            onPress={() => setActiveTab('items')}>
            <Text className={`text-center font-semibold ${activeTab === 'items' ? 'text-white' : 'text-[#7A7A7A]'}`}>Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-full py-2 ${activeTab === 'logs' ? 'bg-[#7370FF]' : ''}`}
            onPress={() => setActiveTab('logs')}>
            <Text className={`text-center font-semibold ${activeTab === 'logs' ? 'text-white' : 'text-[#7A7A7A]'}`}>Logs</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-2 flex-row items-center rounded-xl border border-[#EEE] bg-white px-3">
          <Ionicons name="search" size={16} color="#9A9A9A" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={activeTab === 'items' ? 'Search item name...' : 'Search log item...'}
            placeholderTextColor="#9A9A9A"
            className="ml-2 h-11 flex-1 text-[14px] text-[#1E1E1E]"
          />
        </View>

        {activeTab === 'items' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`mr-2 rounded-full border px-4 py-2 ${selectedCategory === cat ? 'border-[#7370FF] bg-[#7370FF]' : 'border-[#E5E5E5] bg-white'}`}>
                <Text className={`text-[12px] font-semibold ${selectedCategory === cat ? 'text-white' : 'text-[#737373]'}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {actionTypes.map((action) => (
                <TouchableOpacity
                  key={action}
                  onPress={() => setSelectedAction(action)}
                  className={`mr-2 rounded-full border px-4 py-2 ${selectedAction === action ? 'border-[#7370FF] bg-[#7370FF]' : 'border-[#E5E5E5] bg-white'}`}>
                  <Text className={`text-[12px] font-semibold ${selectedAction === action ? 'text-white' : 'text-[#737373]'}`}>
                    {action === 'all' ? 'All actions' : ACTION_LABELS[action] || action}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="flex-row">
              {(['all', '7d', '30d'] as const).map((d) => (
                <TouchableOpacity key={d} onPress={() => setDateRange(d)} className={`mr-2 rounded-lg px-3 py-1 ${dateRange === d ? 'bg-[#EAE8FF]' : 'bg-[#EFEFEF]'}`}>
                  <Text className={`text-[12px] ${dateRange === d ? 'text-[#5F5BD5]' : 'text-[#666]'}`}>{d === 'all' ? 'All time' : d === '7d' ? 'Last 7d' : 'Last 30d'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {canAdd && activeTab === 'items' && (
        <TouchableOpacity onPress={() => setShowAdd(true)} className="mx-5 mb-3 h-[48px] items-center justify-center rounded-[12px] bg-[#7370FF]">
          <Text className="text-[15px] font-bold text-white">Add Inventory Item</Text>
        </TouchableOpacity>
      )}
      {canEdit && activeTab === 'logs' && (
        <TouchableOpacity onPress={() => setShowAddLog(true)} className="mx-5 mb-3 h-[44px] items-center justify-center rounded-[12px] bg-[#5F5BD5]">
          <Text className="text-[14px] font-bold text-white">Add Log Entry</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color="#7370FF" size="large" className="mt-12" />
      ) : error ? (
        <View className="mt-12 items-center px-8">
          <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
          <Text className="mt-3 text-center text-[#666]">{error}</Text>
          <TouchableOpacity onPress={load} className="mt-4 rounded-lg bg-[#7370FF] px-4 py-2">
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }} className="px-5">
          <TouchableOpacity onPress={refresh} className="mb-2 self-end rounded-md bg-[#EFEFFF] px-3 py-1">
            <Text className="text-[12px] text-[#5F5BD5]">{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>

          {activeTab === 'items' &&
            (filteredItems.length === 0 ? (
              <View className="mt-14 items-center">
                <Ionicons name="cube-outline" size={38} color="#B0B0B0" />
                <Text className="mt-2 text-[#8A8A8A]">No inventory items found.</Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const status = stockStatus(item.quantity, item.critical_level);
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="mb-3 rounded-2xl bg-white p-4"
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
                    onPress={() => {
                      if (!canEdit) return;
                      Alert.alert(item.item_name, 'Choose action', [
                        { text: 'Update', onPress: () => { setEditItem(item); setEditName(item.item_name); setEditQty(String(item.quantity)); } },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }}>
                    <View className="mb-2 flex-row items-start justify-between">
                      <Text className="mr-2 flex-1 text-[16px] font-bold text-[#202020]" numberOfLines={2}>{item.item_name}</Text>
                      <View className="rounded-full px-2 py-1" style={{ backgroundColor: status.bg }}>
                        <Text className="text-[10px] font-semibold text-white">{status.label}</Text>
                      </View>
                    </View>
                    <Text className="text-[12px] text-[#7A7A7A]">{item.category}</Text>
                    <View className="mt-2 flex-row justify-between">
                      <Text className="text-[13px] text-[#333]">Qty: <Text className="font-semibold">{item.quantity} {item.unit || 'pcs'}</Text></Text>
                      <Text className="text-[13px] text-[#333]">Critical: <Text className="font-semibold">{item.critical_level}</Text></Text>
                    </View>
                    <Text className="mt-1 text-[13px] text-[#333]">Price: <Text className="font-semibold">PHP {item.price}</Text></Text>
                  </TouchableOpacity>
                );
              })
            ))}

          {activeTab === 'logs' &&
            (filteredLogs.length === 0 ? (
              <View className="mt-14 items-center">
                <Ionicons name="document-text-outline" size={38} color="#B0B0B0" />
                <Text className="mt-2 text-[#8A8A8A]">No inventory logs found.</Text>
              </View>
            ) : (
              filteredLogs.map((log) => (
                <View key={log.id} className="mb-3 rounded-2xl bg-white p-4" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="mr-2 flex-1 text-[15px] font-bold text-[#202020]" numberOfLines={2}>{log.item_name}</Text>
                    <Text className="rounded-full bg-[#EEF0FF] px-2 py-1 text-[10px] font-semibold text-[#5D59D4]">{ACTION_LABELS[log.action_type] || log.action_type}</Text>
                  </View>
                  <Text className="text-[13px] text-[#2D2D2D]">Quantity: {log.quantity} {log.unit || 'pcs'}</Text>
                  <Text className="text-[13px] text-[#666]">Project: {log.project_name || 'N/A'}</Text>
                  <Text className="text-[13px] text-[#666]">Location: {log.location || 'N/A'}</Text>
                  <Text className="text-[13px] text-[#666]">By: {log.actor_name || 'Unknown user'}</Text>
                  <Text className="text-[13px] text-[#666]">Date: {new Date(log.created_at).toLocaleString()}</Text>
                  {!!log.notes && <Text className="mt-1 text-[13px] italic text-[#666]">Notes: {log.notes}</Text>}
                </View>
              ))
            ))}
        </ScrollView>
      )}

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View className="rounded-3xl bg-white p-6">
            <Text className="mb-4 text-center text-[18px] font-bold text-[#7370FF]">Add Inventory Item</Text>
            <TouchableOpacity onPress={() => setShowItemPicker((prev) => !prev)} style={inputStyle} className="flex-row items-center justify-between">
              <Text className={`${addName ? 'text-[#1E1E1E]' : 'text-[#A3A3A3]'}`}>{addName || 'Select item...'}</Text>
              <Ionicons name={showItemPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#7370FF" />
            </TouchableOpacity>
            {showItemPicker && (
              <View className="mb-2 overflow-hidden rounded-xl border border-[#E7E7EE]">
                {Object.keys(PREDEFINED_ITEMS).map((name) => (
                  <TouchableOpacity key={name} className="border-b border-[#EFEFEF] px-4 py-3" onPress={() => { setAddName(name); setAddCategory(PREDEFINED_ITEMS[name]); setShowItemPicker(false); }}>
                    <Text>{name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput value={addCategory} onChangeText={setAddCategory} style={inputStyle} placeholder="Category" />
            <TextInput value={addUnit} onChangeText={setAddUnit} style={inputStyle} placeholder="Unit (e.g. pcs, bag)" />
            <TextInput value={addPrice} onChangeText={setAddPrice} style={inputStyle} placeholder="Price" keyboardType="numeric" />
            <TextInput value={addCritical} onChangeText={setAddCritical} style={inputStyle} placeholder="Critical level" keyboardType="numeric" />
            <TextInput value={addQty} onChangeText={setAddQty} style={inputStyle} placeholder="Current stock" keyboardType="numeric" />
            <TouchableOpacity onPress={handleAdd} disabled={saving} className="mt-2 h-12 items-center justify-center rounded-xl bg-[#7370FF]">
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Save Item</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!editItem} transparent animationType="fade" onRequestClose={() => setEditItem(null)}>
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View className="w-full max-w-sm rounded-3xl bg-white p-6">
            <Text className="mb-4 text-center text-[18px] font-bold text-[#7370FF]">Edit Item</Text>
            <TextInput value={editName} onChangeText={setEditName} style={inputStyle} placeholder="Item name" />
            <TextInput value={editQty} onChangeText={setEditQty} style={inputStyle} placeholder="Quantity" keyboardType="numeric" />
            <TouchableOpacity onPress={handleUpdate} disabled={saving} className="h-12 items-center justify-center rounded-xl bg-[#7370FF]">
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Update</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddLog} transparent animationType="fade" onRequestClose={() => setShowAddLog(false)}>
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View className="w-full rounded-3xl bg-white p-6">
            <Text className="mb-4 text-center text-[18px] font-bold text-[#7370FF]">Add Inventory Log</Text>
            <Text className="mb-1 text-[12px] text-[#666]">Item</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setLogItemId(String(item.id))}
                  className={`mr-2 rounded-full px-3 py-2 ${logItemId === String(item.id) ? 'bg-[#EAE8FF]' : 'bg-[#EFEFEF]'}`}>
                  <Text className={`${logItemId === String(item.id) ? 'text-[#5F5BD5]' : 'text-[#666]'}`}>{item.item_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="mb-1 text-[12px] text-[#666]">Action Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {actionTypes.filter((a) => a !== 'all').map((action) => (
                <TouchableOpacity
                  key={action}
                  onPress={() => setLogActionType(action)}
                  className={`mr-2 rounded-full px-3 py-2 ${logActionType === action ? 'bg-[#EAE8FF]' : 'bg-[#EFEFEF]'}`}>
                  <Text className={`${logActionType === action ? 'text-[#5F5BD5]' : 'text-[#666]'}`}>{ACTION_LABELS[action] || action}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={logQty} onChangeText={setLogQty} style={inputStyle} keyboardType="numeric" placeholder="Quantity" />
            <TextInput value={logNotes} onChangeText={setLogNotes} style={inputStyle} placeholder="Remarks / notes" />
            <TouchableOpacity onPress={handleAddLog} disabled={saving} className="h-12 items-center justify-center rounded-xl bg-[#7370FF]">
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Save Log</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
